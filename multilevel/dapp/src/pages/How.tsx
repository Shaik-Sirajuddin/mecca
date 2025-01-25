import { Helmet } from 'react-helmet-async';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'


const How = () => {
  return (
    <>
    <Helmet>
        <title>Mecca || How</title>
        <meta property="og:title" content="A very important title"/>
    </Helmet>

      <div className='w-full'>
              {/* Start TeamBee Changes */}
           <section className='w-full relative md:min-h-[600px] lg:min-h-[800px] lg:pb-6 pb-16 pt-32 lg:pt-[254px]'>
           <div className="w-full h-screen absolute top-0 left-0 bg-black5/50"></div>
            <video src="how-bg.mp4" className='w-screen top-0 left-0 bg-cover -z-10 object-cover h-screen absolute' loop muted autoPlay></video>
             {/* End TeamBee Changes */}
            <div className="w-full max-w-[1152px] mx-auto px-10 relative z-20">
            <div className="w-full text-center">
              <div className="inline-flex items-center justify-center">
                <img src="Mecca-Purple-Logo.png" className='lg:w-[102px] w-[80px] mr-1' alt="" />
                <span className='text-center font-dm-sans font-black lg:text-2xl text-base text-white uppercase'>CRYPTO</span>
              </div>
              <h1 className='text-[32px] lg:text-[54px] leading-10 text-white font-dm-sans font-bold mt-4 mb-6'>Transforming Efforts into Future Assets!</h1>
              <p className='text-base font-semibold leading-6 mb-5 text-white max-w-[974px] mx-auto mt-2'>MECCA CRYPTO provides a sustainable network environment for participants based on technical transparency and stability. Participants can build strong communities with the users they invite, discover the value of collaboration, and share economic opportunities.</p>
              <p className='text-base font-semibold leading-6 text-white max-w-[974px] mx-auto mt-2'>The moment you join the pool, you'll experience more than just rewards. MECCA CRYPTO will transform your efforts into the assets of the future and make the new economic possibilities of blockchain technology a reality. Usher in a new era of the digital economy with MECCA CRYPTO.</p>
            </div>
            </div>
            <div className="w-full bg-xl-gradient absolute h-[185px] z-10 -bottom-6"></div>
            </section>
          {/* Start TeamBee Changes: bg-black4 to bg-black5 */}
            <section className='w-full relative bg-black5 bg-cover bg-no-repeat bg-center pt-10 md:pb-10'>
            <div className="w-full max-w-[1152px] mx-auto px-5">
                <div className="mb-7">
                  <h2 className='text-2xl text-magenta1 font-semibold text-center mb-3 uppercase'>STAGE STRUCTURE</h2>
                  <p className='text-base text-white text-center font-medium'>Participation cost</p>
                </div>
                <div className="w-full text-center">
                <div className="md:max-w-[400px] max-w-[300px] flex flex-col gap-1.5 mx-auto">
                    <div className="text-center inline-flex items-center md:px-0 px-24  justify-center mx-auto">
                      <img src="triangle-1.png" alt="triangle" />
                      <span className='absolute text-white md:text-sm text-[10px] font-medium mt-5'>STAGE A</span>
                      <span className='absolute text-white md:text-sm text-[10px] font-semibold md:mt-16 mt-12'>2,000 MEA</span>
                    </div>
                    <div className="text-center inline-flex items-center md:px-0 px-12 justify-center mx-auto">
                      <img src="triangle-2.png" alt="triangle" />
                      <span className='absolute text-white md:text-sm text-[10px] font-medium -mt-2'>STAGE B</span>
                      <span className='absolute text-white md:text-sm text-[10px] font-semibold md:mt-10 mt-6'>10,000 MEA</span>
                    </div>
                    <div className="text-center inline-flex items-center justify-center mx-auto">
                      <img src="triangle-3.png" alt="triangle" />
                      <span className='absolute text-white md:text-sm text-[10px] font-medium -mt-2'>STAGE C</span>
                      <span className='absolute text-white md:text-sm text-[10px] font-semibold md:mt-10 mt-6'>30,000 MEA</span>
                    </div>

                </div>
                <p className='text-base text-white font-medium mt-8'>Users can participate in only one stage at a time.</p>
                </div>

              </div>
            </section>
 {/* Start TeamBee Changes: bg-black4 to bg-black5 */}
            <section className='bg-black5 md:py-10 pt-20'>
            <div className="w-full max-w-[1152px] mx-auto px-5">
            <h2 className='text-2xl text-magenta1 font-semibold text-center pb-14 uppercase'>REWARD TYPES</h2>

              <div className="w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-14  justify-center ">
                <div className="w-full max-w-[262px] lg:pr-14 relative text-center mx-auto">
                  <h3 className='text-white text-base font-semibold text-center'>OWNER BONUS</h3>
                  <p className='text-white text-[10px] font-medium text-center mt-2 mb-6'>Users receive a fixed number of tokens daily for 2,000 days based on their participation stage</p>
                  <div className="flex justify-center md:translate-x-12 translate-x-6">
                  <div className="relative mx-auto">
                  <div className="w-11 text-center pt-1 relative bg-magenta1 h-[266px] overflow-hidden mx-auto z-10 rounded">
                    <span className='text-sm text-center text-white font-medium mb-3 pt-1 block'>A</span>
                    <div className="w-full bg-magenta2 shadow-shadow1 h-full rounded ">
                    <span className='text-sm text-center text-white font-medium pt-9 mb-8 block'>B</span>
                    <div className="w-full bg-magenta3 shadow-shadow1 h-full rounded text-center">
                    <span className='text-sm text-center text-white font-medium pt-[58px] block'>C</span>
                    </div>
                    </div>
                  </div>
                    <div className="w-[152px] h-2 bg-xxl-gradient absolute -bottom-1 left-1/2 -translate-x-1/2 z-0"></div>
                  </div>
                  <ul className='text-white text-xs  max-w-[140px] font-medium ml-3 mr-0 '>
                    <li>
                      <p className='text-white text-xs font-medium text-start mb-7'>2 tokens per day 
                      (Total: 4,000 tokens) </p>
                    </li>
                    <li>
                      <p className='text-white text-xs font-medium text-start mb-12'>10 tokens per day 
                      (Total: 20,000 tokens) </p>
                    </li>
                    <li>
                      <p className='text-white text-xs font-medium text-start'>30 tokens per day
                      (Total: 60,000 tokens) </p>
                    </li>
                  </ul>
                  </div>
                </div>
                <div className="w-full max-w-[192px] relative text-center mx-auto">
                  <h3 className='text-white text-base font-semibold text-center'>START BONUS</h3>
                  <p className='text-white text-[10px] font-medium text-center mt-2 mb-6'>When a directly referred user participates in a stage, the referrer receives a bonus</p>
                  <div className="flex justify-center">
                  <div className="relative mx-auto">
                  <div className="w-11 text-center pt-1 relative bg-magenta1 h-[266px] overflow-hidden mx-auto z-10 rounded">
                    <span className='text-sm text-center text-white font-medium mb-3 pt-1 block'>A</span>
                    <div className="w-full bg-magenta2 shadow-shadow1 h-full rounded ">
                    <span className='text-sm text-center text-white font-medium pt-9 mb-8 block'>B</span>
                    <div className="w-full bg-magenta3 shadow-shadow1 h-full rounded text-center">
                    <span className='text-sm text-center text-white font-medium pt-[58px] block'>C</span>
                    </div>
                    </div>
                  </div>
                    <div className="w-[152px] h-2 bg-xxl-gradient absolute -bottom-1 left-1/2 -translate-x-1/2 z-0"></div>
                  </div>
                  <ul className='text-white text-xs font-medium absolute left-1/2 -translate-x-1/2 ml-11 mt-4 max-w-[132px]'>
                    <li>
                      <p className='text-white text-xs font-medium text-start mb-12'>10%</p>
                    </li>
                    <li>
                      <p className='text-white text-xs font-medium text-start mb-24'>20%</p>
                    </li>
                    <li>
                      <p className='text-white text-xs font-medium text-start -mt-1'>5%</p>
                    </li>
                  </ul>
                  </div>
                  <p className='text-[10px] text-white font-medium mt-6 max-w-[150px] mx-auto'>of the referred user's payment amount</p>
                </div>
                <div className="w-full max-w-[200px] relative text-center mx-auto">
                  <h3 className='text-white text-base font-semibold text-center'>ACTIVE BONUS</h3>
                  <p className='text-white text-[10px] font-medium text-center mt-2 mb-6'>Users receive bonuses from the participation payments of users in their 2nd to 6th levels (indirect referrals)</p>
                  <div className="flex justify-center">
                  <div className="relative mx-auto">
                  <div className="w-11 text-center pt-1 relative bg-magenta1 h-[266px] overflow-hidden mx-auto z-10 rounded">
                    <span className='text-sm text-center text-white font-medium mb-3 pt-1 block'>A</span>
                    <div className="w-full bg-magenta2 shadow-shadow1 h-full rounded ">
                    <span className='text-sm text-center text-white font-medium pt-9 mb-8 block'>B</span>
                    <div className="w-full bg-magenta3 shadow-shadow1 h-full rounded text-center">
                    <span className='text-sm text-center text-white font-medium pt-[58px] block'>C</span>
                    </div>
                    </div>
                  </div>
                    <div className="w-[152px] h-2 bg-xxl-gradient absolute -bottom-1 left-1/2 -translate-x-1/2 z-0"></div>
                  </div>
                  <ul className='text-white text-xs font-medium absolute left-1/2 -translate-x-1/2 ml-11 mt-4 max-w-[132px]'>
                    <li>
                      <p className='text-white text-xs font-medium text-start mb-12'>3%</p>
                    </li>
                    <li>
                      <p className='text-white text-xs font-medium text-start mb-24'>4%</p>
                    </li>
                    <li>
                      <p className='text-white text-xs font-medium text-start -mt-1'>5%</p>
                    </li>
                  </ul>
                  </div>
                  
                </div>
                <div className="w-full max-w-[262px] px-6 relative text-center mx-auto">
                  <h3 className='text-white text-base font-semibold text-center'>DEEP BONUS</h3>
                  <p className='text-white text-[10px] font-medium text-center mt-2 mb-6'>Users receive bonuses from the participation payments of users in their 7th to 30th levels</p>
                  <div className="flex justify-center">
                  <div className="relative mx-auto">
                  <div className="w-11 text-center pt-1 relative bg-magenta1 h-[266px] overflow-hidden mx-auto z-10 rounded">
                    <span className='text-sm text-center text-white font-medium mb-6 pt-6 block'>C</span>
                    <div className="w-full bg-magenta2 shadow-shadow1 h-full rounded ">
                    <span className='text-sm text-center text-white font-medium pt-8 mb-8 block'>B</span>
                    <div className="w-full bg-magenta3 shadow-shadow1 h-full rounded text-center">
                    <span className='text-sm text-center text-white font-medium pt-10 block'>A</span>
                    </div>
                    </div>
                  </div>
                    <div className="w-[152px] h-2 bg-xxl-gradient absolute -bottom-1 left-1/2 -translate-x-1/2 z-0"></div>
                  </div>
                  <ul className='text-white text-xs font-medium -ml-14 max-w-[100px] mt-4 -mr-8'>
                    <li>
                      <p className='text-white text-xs font-medium text-start mb-10'>7th–30th levels
                      1%</p>
                    </li>
                    <li>
                      <p className='text-white text-xs font-medium text-start mb-20'>7th–20th levels
                      1%</p>
                    </li>
                    <li>
                      <p className='text-white text-xs font-medium text-start'>7th–10th levels 1%</p>
                    </li>
                  </ul>
                  </div>
                </div>
            


              </div>


                <div className="w-full py-20 max-w-[842px] mx-auto">
                  <h2 className='text-2xl text-magenta1 font-semibold text-center pb-10 uppercase'>STAGE UPGRADES & Bonus Adjustments for Upgrades
                  </h2>
                  <div className="w-full flex md:flex-row flex-col items-center md:gap-12 gap-10">
                    <div className="">
                    <p className='text-white text-sm font-normal mb-6'>Users can upgrade from their current stage to a higher stage at any time. </p>
                    <p className='text-white text-sm font-normal mb-6'>- Upon upgrading, the 2,000-day timestamp resets, and additional rewards are calculated based on the remaining days.  </p>
                    <p className='text-white text-sm font-normal '>- Rewards already received from the previous stage are deducted from the new stage's total reward.</p>
                    </div>
                    <div className="">
                      <img src="UPGRADES-vector.svg" className='min-w-[88px]' alt="" />
                    </div>
                    <div className="">
                    <p className='text-white text-sm font-normal mb-6'>When a lower-level user upgrades to a higher stage, the referrer receives an adjusted bonus based on the total payment amount.  </p>
                    <p className='text-white text-sm font-normal mb-6'>Previously distributed bonuses (Start, Active, Deep) are deducted, and the remaining amount is recalculated and distributed.</p>
                    </div>
                  </div>
                </div>  


                  <div className="w-full pb-20">
                  <h2 className='text-2xl text-magenta1 font-semibold text-center pb-10 uppercase'>STAGE TERMINATION</h2>
                  <div className="w-full flex md:flex-row flex-col items-center gap-16">
                    <img src="TERMINATION-vector.svg" alt="" />
                    <div className="">
                    <p className='text-white text-sm font-medium mb-4'>When a lower-level user upgrades to a higher stage, the referrer receives an adjusted bonus based on the total payment amount.  </p>
                        <ul className='list-disc pl-6 text-white'>
                          <li>
                         <p className='text-white text-sm font-medium mb-1'>2,000 days have elapsed since participation.</p>
                          </li>
                          <li>
                         <p className='text-white text-sm font-medium mb-1'>The total rewards reach 1,000% of the stage participation cost.  </p>
                          </li>
                        </ul>
                    <p className='text-white text-sm font-medium mt-4'>After termination, all accumulated rewards can be withdrawn, but no additional rewards will be generated. Users can rejoin a stage to restart participation.</p>
                    </div>
                  </div>
                  </div>

                  <div className="w-full pb-20 mx-auto max-w-[918px]">
                    <div className="w-full grid md:grid-cols-2 grid-cols-1 md:gap-[100px] gap-14"> 
                      <div className="w-full">
                      <h2 className='text-2xl text-magenta1 font-semibold text-center md:pb-11 pb-6 uppercase'>BONUS WITHDRAWL CONDITIONS</h2> 
                      <div className="w-full flex md:flex-row flex-col justify-center items-center md:gap-10 gap-6">
                        <img src="BONUS-vector.svg" alt="" />
                      <p className='text-white text-sm font-normal md:text-start text-center mb-6'>Users must have at least *2 direct referrals* to withdraw bonuses</p>
                      </div>
                      </div>
                      <div className="w-full px-6">
                      <h2 className='text-2xl text-magenta1 font-semibold text-center md:pb-11 pb-6 uppercase'>PLATFORM FEES</h2> 
                      <div className="w-full flex md:flex-row flex-col justify-center items-center md:gap-10 gap-6">
                        <img src="PLATFORM-vector.svg" alt="" />
                      <p className='text-white text-sm font-normal md:text-start text-center mb-6'>One token is deducted daily from the Owner Bonus as a platform fee.</p>
                      </div>
                      </div>

                    </div>

                    <p className='text-white md:text-base text-sm font-medium md:font-semibold text-center md:pt-20 pt-10'>This mechanism ensures a fair and sustainable reward system for all participants, encouraging active engagement and long-term participation in the MECCA CRYPTO ecosystem.</p>
                    
                  </div>


              </div>
            </section>

 {/* Start TeamBee Changes: bg-black4 to bg-black5 */}
            <section className='w-full bg-black5 pb-20 lg:pb-[132px]'>
            <div className="w-full max-w-[1152px] mx-auto px-5">
            <h2 className='text-2xl text-magenta1 pb-16 font-semibold text-center uppercase'>FREQUENTLY ASKED QUESTIONS</h2>
              <div className="w-full">
                <div className="mx-auto w-full divide-y divide-gray1 ">
                  <Disclosure as="div" className="md:p-4 p-3" defaultOpen={true}>
                    <DisclosureButton className="group flex w-full text-start justify-between gap-5">
                      <span className="text-base md:font-semibold font-normal text-gray5 group-data-[open]:text-magenta1">
                      What is this platform, and how does it work?
                      </span>
                      <svg className="min-w-5 w-5 fill-gray5 group-data-[open]:rotate-180 group-data-[open]:fill-magenta1"
                        xmlns="http://www.w3.org/2000/svg"
                        width={32}
                        height={32}
                        fill="#000000"
                        viewBox="0 0 256 256"
                      >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                      </svg>

                    </DisclosureButton>
                    <DisclosurePanel className="mt-4 text-sm text-white">
                    This platform allows users to participate in various stages of investment or staking using cryptocurrency. Participants earn rewards over time, and additional benefits may include referral bonuses and upgrade options.
                    </DisclosurePanel>
                  </Disclosure>
                  <Disclosure as="div" className="md:p-4 p-3">
                    <DisclosureButton className="group flex w-full text-start justify-between gap-5">
                      <span className="text-base md:font-semibold font-normal text-gray5 group-data-[open]:text-magenta1">
                      How can I start participating on this platform?
                      </span>

                      <svg className="min-w-5 w-5 fill-gray5 group-data-[open]:rotate-180 group-data-[open]:fill-magenta1"
                        xmlns="http://www.w3.org/2000/svg"
                        width={32}
                        height={32}
                        fill="#000000"
                        viewBox="0 0 256 256"
                      >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                      </svg>
                    </DisclosureButton>
                    <DisclosurePanel className="mt-4 text-sm text-white">
                    This platform allows users to participate in various stages of investment or staking using cryptocurrency. Participants earn rewards over time, and additional benefits may include referral bonuses and upgrade options.
                    </DisclosurePanel>
                  </Disclosure>
                  <Disclosure as="div" className="md:p-4 p-3">
                    <DisclosureButton className="group flex w-full text-start justify-between gap-5">
                      <span className="text-base md:font-semibold font-normal text-gray5 group-data-[open]:text-magenta1">
                      How does the referral system work?
                      </span>

                      <svg className="min-w-5 w-5 fill-gray5 group-data-[open]:rotate-180 group-data-[open]:fill-magenta1"
                        xmlns="http://www.w3.org/2000/svg"
                        width={32}
                        height={32}
                        fill="#000000"
                        viewBox="0 0 256 256"
                      >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                      </svg>
                    </DisclosureButton>
                    <DisclosurePanel className="mt-4 text-sm text-white">
                    This platform allows users to participate in various stages of investment or staking using cryptocurrency. Participants earn rewards over time, and additional benefits may include referral bonuses and upgrade options.
                    </DisclosurePanel>
                  </Disclosure>
                  <Disclosure as="div" className="md:p-4 p-3">
                    <DisclosureButton className="group flex w-full text-start justify-between gap-5">
                      <span className="text-base md:font-semibold font-normal text-gray5 group-data-[open]:text-magenta1">
                      Can I upgrade my participation stage?
                      </span>

                      <svg className="min-w-5 w-5 fill-gray5 group-data-[open]:rotate-180 group-data-[open]:fill-magenta1"
                        xmlns="http://www.w3.org/2000/svg"
                        width={32}
                        height={32}
                        fill="#000000"
                        viewBox="0 0 256 256"
                      >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                      </svg>
                    </DisclosureButton>
                    <DisclosurePanel className="mt-4 text-sm text-white">
                    This platform allows users to participate in various stages of investment or staking using cryptocurrency. Participants earn rewards over time, and additional benefits may include referral bonuses and upgrade options.
                    </DisclosurePanel>
                  </Disclosure>
                  <Disclosure as="div" className="md:p-4 p-3">
                    <DisclosureButton className="group flex w-full text-start justify-between gap-5">
                      <span className="text-base md:font-semibold font-normal text-gray5 group-data-[open]:text-magenta1">
                      What are the conditions for withdrawing my rewards or bonuses?
                      </span>

                      <svg className="min-w-5 w-5 fill-gray5 group-data-[open]:rotate-180 group-data-[open]:fill-magenta1"
                        xmlns="http://www.w3.org/2000/svg"
                        width={32}
                        height={32}
                        fill="#000000"
                        viewBox="0 0 256 256"
                      >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                      </svg>
                    </DisclosureButton>
                    <DisclosurePanel className="mt-4 text-sm text-white">
                    This platform allows users to participate in various stages of investment or staking using cryptocurrency. Participants earn rewards over time, and additional benefits may include referral bonuses and upgrade options.
                    </DisclosurePanel>
                  </Disclosure>
                  <Disclosure as="div" className="md:p-4 p-3">
                    <DisclosureButton className="group flex w-full text-start justify-between gap-5">
                      <span className="text-base md:font-semibold font-normal text-gray5 group-data-[open]:text-magenta1">
                      Who can I contact for support or assistance?
                      </span>

                      <svg className="min-w-5 w-5 fill-gray5 group-data-[open]:rotate-180 group-data-[open]:fill-magenta1"
                        xmlns="http://www.w3.org/2000/svg"
                        width={32}
                        height={32}
                        fill="#000000"
                        viewBox="0 0 256 256"
                      >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                      </svg>
                    </DisclosureButton>
                    <DisclosurePanel className="mt-4 text-sm text-white">
                    This platform allows users to participate in various stages of investment or staking using cryptocurrency. Participants earn rewards over time, and additional benefits may include referral bonuses and upgrade options.
                    </DisclosurePanel>
                  </Disclosure>
                </div>
              </div>
              </div>
            </section>

        </div>

    </>
  )
}

export default How;