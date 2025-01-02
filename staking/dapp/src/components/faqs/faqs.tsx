import Accordion from "react-bootstrap/Accordion";
import "./style.css";

function Faqs() {
  return (
    <Accordion className="faqs-wrap" defaultActiveKey="0">
      <Accordion.Item eventKey="0" className="faq-item">
        <Accordion.Header className="faq-head">
          <span>01</span> How can I stake MEA tokens?
        </Accordion.Header>
        <Accordion.Body className="faq-body">
          MEA token staking is available on the MECCA staking website. Connect
          your wallet, select the number of MEA tokens you want to stake, and
          click the "Start Staking" button. After staking, you can monitor your
          rewards regularly. MEA tokens can be obtained through pre-sales,
          airdrops, or by purchasing them from listed exchanges.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1" className="faq-item">
        <Accordion.Header className="faq-head">
          <span>02</span> How are staking rewards calculated?
        </Accordion.Header>
        <Accordion.Body className="faq-body">
          Staking rewards are calculated based on the number of tokens staked
          and the duration of the staking period. The Annual Percentage Rate
          (APR) may vary depending on platform policies and ecosystem
          conditions. Real-time reward rates can be checked on the staking page.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2" className="faq-item">
        <Accordion.Header className="faq-head">
          <span>03</span> Can I withdraw staked MEA tokens anytime?
        </Accordion.Header>
        <Accordion.Body className="faq-body">
          Staked MEA tokens can be withdrawn freely after the lock-up period
          ends. The lock-up period and conditions are specified when choosing a
          staking program and may vary based on platform policies. Reward
          earnings, however, can be withdrawn at any time without a lock-up
          period.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="3" className="faq-item">
        <Accordion.Header className="faq-head">
          <span>04</span> Where can I check my staking rewards?
        </Accordion.Header>
        <Accordion.Body className="faq-body">
          Staking rewards can be viewed in real-time on the staking dashboard.
          Rewards are updated regularly and can either be automatically
          transferred to your wallet or accumulated for additional staking.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="4" className="faq-item">
        <Accordion.Header className="faq-head">
          <span>05</span> What is the minimum amount of MEA tokens required for
          staking?
        </Accordion.Header>
        <Accordion.Body className="faq-body">
          The minimum amount required to participate in staking is 1,000 MEA.
          The maximum amount that can be staked is 10,000,000 MEA. These limits
          may change depending on platform policies, and detailed information
          can be found on the staking page.
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default Faqs;
