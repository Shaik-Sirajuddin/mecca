
import './style.css'
import { Helmet } from "react-helmet-async";
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Global from '../../components/community/Global';

function Community() {
  return (
     <main className="wrapper community-page">
     <Helmet>
      <title>Home Page</title>
      <meta name="description" content="Welcome to the home page of my application." />
    </Helmet>
      <Header/>
      <Global></Global>
      <Footer/>

</main>
  )
}

export default Community
