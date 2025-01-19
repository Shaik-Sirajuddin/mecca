package utils

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/shopspring/decimal"
	"github.com/xssnick/tonutils-go/address"
	"github.com/xssnick/tonutils-go/liteclient"
	"github.com/xssnick/tonutils-go/tlb"
	"github.com/xssnick/tonutils-go/ton"
	"github.com/xssnick/tonutils-go/ton/jetton"
	"github.com/xssnick/tonutils-go/ton/wallet"
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
