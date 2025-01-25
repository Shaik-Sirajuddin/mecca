import { Helmet } from 'react-helmet-async';


const Dashboard = () => {
  return (
    <>
    <Helmet>
        <title>Mecca || Dashboard</title>
        <meta property="og:title" content="A very important title"/>
    </Helmet>
      {/* Start TeamBee Changes */}
      <div className='w-full bg-black5 relative'>
        <div className="w-full max-w-[1162px] mx-auto absolute h-[623px] rounded-full blur-[200px] -top-[400px] left-1/2 -translate-x-1/2 bg-[#6E3359]"></div>
          
           <section className='w-full relative md:min-h-[600px] lg:min-h-[753px] pb-28 pt-32 lg:pt-[254px]'>
           <div className="w-full h-screen absolute top-0 left-0 bg-black5/50 z-10"></div>
           <video src="dashboard.bg.mp4" className='w-screen top-0 left-0 bg-cover object-cover h-screen absolute' loop muted autoPlay></video>
            <div className="w-full bg-xl-gradient top-[80vh] absolute h-[185px] z-10 -bottom-1"></div>
              {/* End TeamBee Changes */}
            <div className="w-full max-w-[1152px] mx-auto px-10 relative z-20">
            <div className="w-full text-center">
              <div className="inline-flex items-center justify-center">
                <img src="Mecca-Purple-Logo.png" className='lg:w-[102px] w-[80px] mr-1' alt="" />
                <span className='text-center font-dm-sans font-black lg:text-2xl text-base text-white uppercase'>CRYPTO</span>
              </div>
              <h1 className='text-[32px] lg:text-[94px] leading-10 text-white font-dm-sans font-bold mt-7 mb-16'>DASHBOARD</h1>
              <p className='text-2xl uppercase font-semibold leading-6 mb-1 text-white max-w-[974px] mx-auto mt-2'>MY CURRENT PARTICIPATION</p>
              <h4 className='text-[40px] text-magenta1 font-bold font-dm-sans tracking-normal uppercase '>STAGE B</h4>
              <span className='text-white bg-green1 text-xs font-semibold rounded p-1'>ACTIVE</span>
              <p className='text-2xl font-semibold text-white uppercasep mt-7'>PARTICIPATION DAY</p>
              <h4 className='text-[40px] font-bold font-dm-sans text-magenta1 leading-tight'>0000.00.00</h4>
            </div>
            <div className="w-full pt-[70px]">
              <div className="w-full grid md:grid-cols-2 gap-12 grid-cols-1">
                <div className="w-full lg:px-11 px-5 py-6 h-fit lg:py-8 bg-[url(stage-b-bg-2.png)] bg-full-3 bg-center bg-no-repeat">
                <div className="w-full flex items-center justify-between gap-6 flex-wrap mb-5">
                 <p className='text-sm text-white uppercase font-medium'>MY UNIQUE ID HERE</p>
                 <button className='text-xs font-semibold text-white inline-flex items-center justify-center'>
                    <svg
                width={79}
                height={35}
                viewBox="0 0 79 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 6.23757C0 5.81727 0.132413 5.40765 0.378437 5.06687L3.43778 0.829302C3.81377 0.308511 4.41701 0 5.05934 0H77C78.1046 0 79 0.895431 79 2V28.4674C79 28.912 78.8518 29.3439 78.5789 29.695L75.564 33.5727C75.1851 34.06 74.6024 34.3451 73.9851 34.3451H2C0.895429 34.3451 0 33.4496 0 32.3451V6.23757Z"
                  fill="#D107FB"
                />
              </svg>
             <span className='absolute'>Copy</span>
              </button> 
                </div>
                <div className="w-full flex items-center justify-between gap-6 flex-wrap">
                 <p className='text-sm text-white uppercase font-medium'>SOLANA LINK ADDRESS HERE</p>
                 <button className='text-xs font-semibold text-white inline-flex items-center justify-center'>
                    <svg
                width={79}
                height={35}
                viewBox="0 0 79 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 6.23757C0 5.81727 0.132413 5.40765 0.378437 5.06687L3.43778 0.829302C3.81377 0.308511 4.41701 0 5.05934 0H77C78.1046 0 79 0.895431 79 2V28.4674C79 28.912 78.8518 29.3439 78.5789 29.695L75.564 33.5727C75.1851 34.06 74.6024 34.3451 73.9851 34.3451H2C0.895429 34.3451 0 33.4496 0 32.3451V6.23757Z"
                  fill="#D107FB"
                />
              </svg>
             <span className='absolute'>Copy</span>
                </button> 
                </div>

                <div className="w-full my-5">
                  <h3 className='text-2xl text-white font-semibold'>CURRENT POOL AMOUNT</h3>
                  <h4 className='text-[40px] text-magenta1 font-bold font-dm-sans'>5,000 MEA <span></span>   
                    <span className='text-xs text-gray1 font-medium'>Your Balance</span></h4>
                </div>

                <ul className='w-full flex flex-col gap-5'>
                  <li>
                    <h4 className='text-base font-semibold text-white'>Total Direct Referrals</h4>
                    <h3 className='text-[32px] text-white font-bold font-dm-sans leading-tight'>6451</h3>
                  </li>
                  <li>
                    <h4 className='text-base font-semibold text-white'>Withdrawn Amount</h4>
                    <h3 className='text-[32px] text-white font-bold font-dm-sans leading-tight'>64,000 MEA</h3>
                  </li>
                  <li>
                    <h4 className='text-base font-semibold text-white'>Revenue from Referrals</h4>
                    <h3 className='text-[32px] text-white font-bold font-dm-sans leading-tight'>28,000 MEA</h3>
                  </li>
                  <li>
                    <h4 className='text-base font-semibold text-white'>Remaining Reward Period</h4>
                    <h3 className='text-[32px] text-white font-bold font-dm-sans leading-tight'>2m 5d 12h</h3>
                  </li>
                  <li>
                    <h4 className='text-base font-semibold text-white'>Total Reward Paid</h4>
                    <h3 className='text-[32px] text-white font-bold font-dm-sans leading-tight'>125,000 MEA</h3>
                  </li>
                </ul>



                </div>

                <div className="w-full">
                  <div className="w-full mb-[54px] lg:px-11 px-5 py-6 lg:py-8 bg-[url(amount-frame.png)] bg-full bg-center bg-no-repeat">
                    <h3 className='text-2xl text-white font-semibold '>ADD POOL AMOUNT</h3>
                    <p className='text-gray1 text-xs font-medium mb-5'>The minimum amount to be filled in the bonus pool is 1 $MEA.</p>
                    <form className='w-full' id='add-amount-Form'>
                      <div className="w-full">
                      <label htmlFor="Amount*" className='text-xs text-white mb-2 block'>Amount*</label>
                      <input name='Amount*' id='Amount*' type="number" placeholder='Enter Amount' className='bg-black1 text-xs rounded border border-black2 w-full py-2.5 px-3 placeholder:text-gray1 text-white' />
                      </div>
                      <button type='submit' className='text-base relative flex items-center justify-center text-center w-full mt-6 uppercase text-white font-semibold'>
                      <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 426 41"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 7.58831C0 7.11587 0.167242 6.65869 0.47209 6.29777L4.90076 1.05452C5.28077 0.604618 5.83975 0.345062 6.42867 0.345062H424C425.105 0.345062 426 1.24049 426 2.34506V33.636C426 34.0662 425.861 34.4849 425.604 34.8301L422.1 39.5391C421.722 40.0462 421.128 40.3451 420.495 40.3451H2C0.895426 40.3451 0 39.4496 0 38.3451V7.58831Z"
                            fill="#D107FB"
                          />
                        </svg>

                        <span className='absolute'>ADD AMOUNT</span>
                      </button>
                    </form>
                  </div>
                  <div className="w-full lg:px-11 px-5 py-6 lg:py-8 bg-[url(withdrawl-frame.png)] bg-full bg-center bg-no-repeat">
                    <h3 className='text-2xl font-semibold text-white'>WITHDRAWL</h3>
                    <p className='text-gray1 text-xs font-medium mb-5'>A minimum of 7000 TRX is required for withdrawl.</p>
                    <form className='w-full' id='add-withdrawl-Form'>
                        <div className="w-full">
                        <label htmlFor="withdrawl*" className='text-xs text-white mb-2 block'>Amount*</label>
                        <div className="w-full flex items-center gap-3">
                        <input name='withdrawl*' id='withdrawl*' type="number" placeholder='Enter Amount' className='bg-black1 text-xs rounded border border-black2 w-full py-2.5 px-3 placeholder:text-gray1 text-white' />
                        <button className='text-xs font-semibold text-white inline-flex items-center justify-center'>
                              <svg
                          width={79}
                          height={35}
                          viewBox="0 0 79 35"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 6.23757C0 5.81727 0.132413 5.40765 0.378437 5.06687L3.43778 0.829302C3.81377 0.308511 4.41701 0 5.05934 0H77C78.1046 0 79 0.895431 79 2V28.4674C79 28.912 78.8518 29.3439 78.5789 29.695L75.564 33.5727C75.1851 34.06 74.6024 34.3451 73.9851 34.3451H2C0.895429 34.3451 0 33.4496 0 32.3451V6.23757Z"
                            fill="#D107FB"
                          />
                        </svg>
                      <span className='absolute'>MAX</span>
                        </button>
                        </div>
                        
                        </div>
                        <button type='submit' className='text-base relative flex items-center justify-center text-center w-full mt-6 uppercase text-white font-semibold'>
                        <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 426 41"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0 7.58831C0 7.11587 0.167242 6.65869 0.47209 6.29777L4.90076 1.05452C5.28077 0.604618 5.83975 0.345062 6.42867 0.345062H424C425.105 0.345062 426 1.24049 426 2.34506V33.636C426 34.0662 425.861 34.4849 425.604 34.8301L422.1 39.5391C421.722 40.0462 421.128 40.3451 420.495 40.3451H2C0.895426 40.3451 0 39.4496 0 38.3451V7.58831Z"
                              fill="#D107FB"
                            />
                          </svg>

                          <span className='absolute'>WITHDRAW</span>
                        </button>
                    </form>

                    <div className="w-full">
                      <h4 className='text-base font-bold text-white mb-4 mt-7'>WITHDRAWL GUIDE</h4>
                      <ul className='list-decimal text-gray3 pl-6'>
                        <li>
                          <p className='text-sm text-gray3 font-normal'>Enter your Solana Wallet address, which is the invitee, in the designated field.</p>
                        </li>
                        <li>
                          <p className='text-sm text-gray3 font-normal'>Make sure your Solana wallet is connected and ready to trade.</p>
                        </li>
                        <li>
                          <p className='text-sm text-gray3 font-normal'>Enter the invitee's unique code and Solana address to confirm.</p>
                        </li>
                        <li>
                          <p className='text-sm text-gray3 font-normal'>Click the "Make a Deposit" button to start the final stage process.</p>
                        </li>
                      </ul>
                    </div>

                    </div>


                </div>


              </div>
            </div>
            </div>
            </section>
        </div>

    </>
  )
}

export default Dashboard;