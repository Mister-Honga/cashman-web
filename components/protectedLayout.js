import Head from 'next/head'
import '../styles/Home.module.css'
import { useRouter } from "next/router";
import { Layout, Menu} from 'antd';
import 'antd/dist/antd.css';
import Logo from '../public/assets/images/logo-lucas.svg';

const { Header, Content, Footer, Sider } = Layout;
import { DashboardOutlined, UserOutlined, DatabaseOutlined } from '@ant-design/icons';
import {useState} from "react";

export default function ProtectedLayout(props) {
    const router = useRouter();

    const [selectedKey, setSelectedKey] = useState("");
    const [collapsed, setCollapsed] = useState(false);


    function SidebarPanel(){
        return(
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                onBreakpoint={broken => {
                    // console.log(broken);

                }}
            >
                <div className={'logo'}>
                    <Logo />
                </div>

                <Menu theme="dark" mode="inline"
                    defaultSelectedKeys={[selectedKey]}
                      onSelect={(selected)=>{
                          const to = selected.key;
                          setSelectedKey(selected.key);
                          router.push({
                              pathname: to,
                              asPath: to
                          });
                      }}
                      selectedKeys={router.pathname}
                >
                    <Menu.Item key="/" icon={<DashboardOutlined />}>
                        Dashboard
                    </Menu.Item>
                </Menu>
            </Sider>
        );
    }
    return (
        <div>
            <Layout style={{height:"100vh"}}>
                <SidebarPanel />
                <Layout>
                    <Header className="site-layout-sub-header-background" style={{ padding: 0 }}>

                    </Header>
                    {props.children};
                </Layout>
            </Layout>
        </div>
    )
}
