package utils

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gagliardetto/solana-go"
	associatedtokenaccount "github.com/gagliardetto/solana-go/programs/associated-token-account"
	"github.com/gagliardetto/solana-go/programs/token"
	"github.com/gagliardetto/solana-go/rpc"
	confirm "github.com/gagliardetto/solana-go/rpc/sendAndConfirmTransaction"
	"github.com/gagliardetto/solana-go/rpc/ws"
	"github.com/shopspring/decimal"
	"github.com/xssnick/tonutils-go/address"
	"github.com/xssnick/tonutils-go/liteclient"
	"github.com/xssnick/tonutils-go/tlb"
	"github.com/xssnick/tonutils-go/ton"
	"github.com/xssnick/tonutils-go/ton/jetton"
	"github.com/xssnick/tonutils-go/ton/wallet"
	"golang.org/x/time/rate"
)

/*
to -> receiver address
amount -> amount to transfer ( ex : 1 jetton (6 decimals) = 1)
*/
func Transfer(toAddr string, amount string) (bool, string) {

	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered from panic:", r)
		}
	}()
	client := liteclient.NewConnectionPool()

	// connect to testnet lite server
	err := client.AddConnectionsFromConfigUrl(context.Background(), "https://tonutils.com/ls/free-mainnet-config.json")
	if err != nil {
		println(err.Error())
		return false, ""
	}

	ctx := client.StickyContext(context.Background())

	// initialize ton api lite connection wrapper
	api := ton.NewAPIClient(client)

	seedPhrase := os.Getenv("SEED_PHRASE")
	// seed words of account, you can generate them with any wallet or using wallet.NewSeed() method
	words := strings.Split(seedPhrase, " ")

	w, err := wallet.FromSeed(api, words, wallet.ConfigV5R1Final{
		NetworkGlobalID: -239,
		Workchain:       0,
	})
	if err != nil {
		println(err.Error())
		return false, ""
	}

	b, err := api.CurrentMasterchainInfo(ctx)
	if err != nil {
		println(err.Error())
		return false, ""
	}

	addr := address.MustParseAddr("UQAH0YlvzES3-uUxAkmEHMreqeCZs48xkYmGZQuYlF262-y8")
	account, err := api.GetAccount(ctx, b, addr)
	if err != nil {
		println(err.Error())
		return false, ""
	}

	// Balance: 66559946.09 TON
	bal, err := decimal.NewFromString(account.State.Balance.String())
	if bal.LessThan(decimal.NewFromFloat(0.1)) {
		println("fund wallet balance less than set limit : 0.1")
		return false, ""
	}
	if err != nil {
		println(err.Error())
		return false, ""
	}

	token := jetton.NewJettonMasterClient(api, address.MustParseAddr("EQAnOBmSoqfNfw_bGEYVjuG56qLQXcRGBV47LiAnZq5Pxfvo"))

	// find our jetton wallet
	tokenWallet, err := token.GetJettonWallet(ctx, w.WalletAddress())
	if err != nil {
		println(err.Error())
		return false, ""
	}

	amountTokens := tlb.MustFromDecimal(amount, 18)

	comment, err := wallet.CreateCommentCell("Hello from beluga!")
	if err != nil {
		println(err.Error())
		return false, ""
	}

	// address of receiver's wallet (not token wallet, just usual)
	to, err := address.ParseAddr(toAddr)
	if err != nil {
		panic(err)
		return false, ""
	}
	transferPayload, err := tokenWallet.BuildTransferPayloadV2(to, to, amountTokens, tlb.ZeroCoins, comment, nil)
	if err != nil {
		println(err.Error())
		return false, ""
	}

	// your TON balance must be > 0.05 to send
	msg := wallet.SimpleMessage(tokenWallet.Address(), tlb.MustFromTON("0.05"), transferPayload)

	log.Println("sending transaction...")
	tx, _, err := w.SendWaitTransaction(ctx, msg)
	if err != nil {
		println(err.Error())
		return false, ""
	}
	log.Println("transaction confirmed, hash:", hex.EncodeToString(tx.Hash))
	return true, hex.EncodeToString(tx.Hash)
}

func TransferSPLTokens(toAddr string, amount string) (bool, string) {

	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered from panic:", r)
		}
	}()

	cluster := rpc.DevNet

	rpcClient := rpc.NewWithCustomRPCClient(rpc.NewWithLimiter(
		cluster.RPC,
		rate.Every(time.Second), // time frame
		10,                      // limit of requests per time frame
	))

	// Create a new WS client (used for confirming transactions)
	wsClient, err := ws.Connect(context.Background(), rpc.DevNet_WS)
	if err != nil {
		return false, ""
	}

	privateKey, err := solana.PrivateKeyFromSolanaKeygenFile("./key.json")
	if err != nil {
		return false, ""
	}

	toPubKey := solana.MustPublicKeyFromBase58(toAddr)
	amountToTransfer := decimal.RequireFromString(amount).Mul(decimal.RequireFromString("1000000")).Floor()

	//fatal error if key not found
	tokenMint := solana.MustPublicKeyFromBase58(os.Getenv("TOKEN_MINT"))
	holderATA := solana.MustPublicKeyFromBase58(os.Getenv("HOLDER_ATA"))
	userATA, _, err := solana.FindProgramAddress([][]byte{
		toPubKey[:],
		solana.Token2022ProgramID[:],
		tokenMint[:],
	}, solana.SPLAssociatedTokenAccountProgramID)

	if err != nil {
		println("this")
		return false, ""
	}

	balResult, err := rpcClient.GetTokenAccountBalance(context.TODO(), holderATA, rpc.CommitmentConfirmed)

	if err != nil {
		return false, ""
	}

	balance := decimal.RequireFromString(balResult.Value.Amount)
	//6 decimals for mecca token

	if balance.LessThan(amountToTransfer) {
		//insufficient token amount to transfer
		return false, ""
	}

	tx := solana.NewTransactionBuilder()

	userATAInfo, err := rpcClient.GetAccountInfo(context.Background(), userATA)
	_ = userATAInfo

	if err != nil && err.Error() != "not found" {
		println(err.Error())
		println("here", userATA.String())
		return false, ""
	}

	if err != nil && err.Error() == "not found" {
		// user token account not created
		tx.AddInstruction(associatedtokenaccount.NewCreateInstruction(privateKey.PublicKey(), toPubKey, tokenMint).Build())
	}

	token.SetProgramID(solana.Token2022ProgramID)
	transferInstructionBuilder := token.NewTransferCheckedInstructionBuilder()
	transferInstructionBuilder.
		SetAmount(amountToTransfer.BigInt().Uint64()).
		SetDecimals(6).
		SetSourceAccount(holderATA).
		SetMintAccount(tokenMint).
		SetDestinationAccount(userATA).
		SetOwnerAccount(privateKey.PublicKey(), privateKey.PublicKey())

	// (amountToTransfer.BigInt().Uint64(), 6, holderATA, tokenMint, userATA, holderATA, []solana.PublicKey{privateKey.PublicKey()})

	tx.AddInstruction(transferInstructionBuilder.Build())
	tx.SetFeePayer(privateKey.PublicKey())

	recent, err := rpcClient.GetLatestBlockhash(context.TODO(), rpc.CommitmentFinalized)
	if err != nil {
		return false, ""
	}

	tx.SetRecentBlockHash(recent.Value.Blockhash)

	builtTX, err := tx.Build()

	if err != nil {
		return false, ""
	}

	_, err = builtTX.Sign(
		func(key solana.PublicKey) *solana.PrivateKey {
			if privateKey.PublicKey().Equals(key) {
				return &privateKey
			}
			return nil
		},
	)

	if err != nil {
		return false, ""
	}

	sig, err := confirm.SendAndConfirmTransaction(
		context.TODO(),
		rpcClient,
		wsClient,
		builtTX,
	)

	println("nice")

	if err != nil {
		println(err.Error())
		return false, ""
	}

	return true, sig.String()
}
