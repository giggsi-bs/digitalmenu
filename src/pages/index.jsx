import Layout from "./Layout.jsx";

import Home from "./Home";

import Menu from "./Menu";

import Admin from "./Admin";

import CategoryItems from "./CategoryItems";

import MenuSchedules from "./MenuSchedules";

import Asi from "./Asi";

import NotAuth from "./NotAuth";

import Start from "./Start";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Menu: Menu,
    
    Admin: Admin,
    
    CategoryItems: CategoryItems,
    
    MenuSchedules: MenuSchedules,
    
    Asi: Asi,
    
    NotAuth: NotAuth,
    
    Start: Start,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Menu" element={<Menu />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/CategoryItems" element={<CategoryItems />} />
                
                <Route path="/MenuSchedules" element={<MenuSchedules />} />
                
                <Route path="/Asi" element={<Asi />} />
                
                <Route path="/NotAuth" element={<NotAuth />} />
                
                <Route path="/Start" element={<Start />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}