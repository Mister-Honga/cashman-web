import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { useEffect, useState} from "react";
import ProtectedLayout from "../components/protectedLayout";
import { Layout, Tabs, Card, Row, Col, Form, InputNumber, Button, Modal, Table, notification, Radio, Typography, message } from 'antd';
import 'antd/dist/antd.css';

import {getATMsAsync, updateATMAsync} from "../stores/modules/atms";

const { Content } = Layout;
const { Column } = Table;
const { Text } = Typography;

export default function Home() {
    const dispatch = useDispatch();
    const [atmsData, setATMsData] = useState([]);
    const [depositData, setDepositData] = useState({});
    const [fixedDepositData, setFixedDepositData] = useState([]);
    const [isModalVisible, setIsModalVisible ] = useState(false);
    const [selectedATM, setSelectedATM ] = useState("");
    const [withdrawableAmount, setWithdrawableAmount] = useState("");
    const [withdrawErrMsg, setWithdrawErrMsg] = useState("");

    const [depositForm, withdrawForm] = Form.useForm();

    const { atms }  = useSelector((state) => {
        return{
            atms: state.atms.atmsData
        };
    }, shallowEqual);

    useEffect(()=>{
        dispatch(getATMsAsync());
    },[]);

    useEffect(()=>{
        setATMsData(atms);
        totalAmountCalc(atms.filter(function(e){return e.location === selectedATM}));
    },[atms]);

    /** Common **/
    const errorMessage = (type, text) => {
        message.error(`${type === 0 ? "Deposit" : "Withdraw"} ${text}`);
    };

    const successMessage = (type, text) => {
        message.success(`${type === 0 ? "Deposit" : "Withdraw"} success!`);
    }

    function totalAmountCalc(data){
        let totalAmount = 0;

        for (const dataKey in data[0]) {
            if(dataKey.includes('aud')){
                totalAmount += parseInt(dataKey.replace(/[^0-9]/g,''))*data[0][dataKey];
            }else if(dataKey.includes('auc')){
                totalAmount += parseInt(dataKey.replace(/[^0-9]/g,''))/100*data[0][dataKey];
            }
        }
        setWithdrawableAmount(totalAmount.toFixed(2));
    }

    /** Select**/
    const handleSelectedATM = (e) =>{
        const value = e.target.value;
        setSelectedATM(value);
        const data = atms.filter(function(e){return e.location === value});

        totalAmountCalc(data);
    };

    function RenderRadioGroup() {
        return(
            atmsData.map((value) =>(
                <Radio.Button key={value.location} value={value.location}>
                    {(value.location).toUpperCase()}
                </Radio.Button>
            ))
        );
    }

    /** Deposit **/
    const handleDepositOK = ()=>{
        updateATM(true, depositData);
        setIsModalVisible(false);
    };

    const handleDepositCancel = ()=>{
        depositForm.resetFields();
        setIsModalVisible(false);
        setDepositData([]);
        setFixedDepositData([]);
    };

    const onFinishDeposit = async (value) =>{
        setIsModalVisible(true);
        const setArray= [];
        if(value){
            for (let valueKey in value) {
                let unit = valueKey.replace(/[0-9]/g,'');
                let name ="";

                unit === 'aud' ? (name=`$${valueKey.replace(/[^0-9]/g,'')}`)
                    : (name=`${valueKey.replace(/[^0-9]/g,'')}￠`) ;

                value[valueKey] ?
                    setArray.push({
                        currency : valueKey,
                        amount : value[valueKey],
                        name : name
                    }) : null;
            }
        }else{

        }
        setDepositData(value);
        setFixedDepositData(setArray);
    };

    function DepositSection(){
        return (
            <Card title="Deposit">
                <Form
                    labelCol={{ flex: '50px' }}
                    labelAlign="left"
                    onFinish={onFinishDeposit}
                    form = {depositForm}
                >
                    <Row>
                        <Col span={11}>
                            <Form.Item label="$100" name="aud100">
                                <InputNumber style={{width:'100%'}} />
                            </Form.Item>
                            <Form.Item label="$50" name="aud50">
                                <InputNumber style={{width:'100%'}} />
                            </Form.Item>
                        </Col>
                        <Col span={11} offset={2}>
                            <Form.Item label="$20" name="aud20">
                                <InputNumber style={{width:'100%'}} />
                            </Form.Item>
                            <Form.Item label="$10" name="aud10">
                                <InputNumber style={{width:'100%'}} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={11}>
                            <Form.Item label="50￠" name="auc50">
                                <InputNumber style={{width:'100%'}} />
                            </Form.Item>
                            <Form.Item label="20￠" name="auc20">
                                <InputNumber style={{width:'100%'}} />
                            </Form.Item>
                        </Col>
                        <Col span={11} offset={2}>
                            <Form.Item label="10￠" name="auc10">
                                <InputNumber style={{width:'100%'}} />
                            </Form.Item>
                            <Form.Item label="5￠" name="auc5">
                                <InputNumber style={{width:'100%'}} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" block disabled={!selectedATM}>
                        Deposit
                    </Button>
                </Form>
            </Card>
        );

    }

    function DepositModal(){
        return (
            <Modal visible={isModalVisible} onOk={handleDepositOK} onCancel={handleDepositCancel} title="입금 확인">
                <Table
                    dataSource={fixedDepositData}
                    rowKey="depositModal"
                    pagination={false}
                    bordered
                    rowClassName={((record, index) => (record.aud50 <5 ?"#fffff":"green"))}
                    summary={totalData => {
                        let totalAmount = 0;

                        totalData.forEach(({currency, amount})=>{
                            if(currency.includes('aud')){
                                totalAmount += parseInt(currency.replace(/[^0-9]/g,''))*amount;
                            }else{
                                totalAmount += parseInt(currency.replace(/[^0-9]/g,''))/100*amount;
                            }
                        });
                        return (
                            <>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                                    <Table.Summary.Cell>$ {totalAmount.toFixed(2)}</Table.Summary.Cell>
                                </Table.Summary.Row>
                            </>
                        )
                    }}
                >
                    <Column title="Currency" dataIndex="name" key="currency"/>
                    <Column title="Amount" dataIndex="amount" key="amount"/>
                </Table>
            </Modal>
        );
    }

    /** Withdraw **/
    function withdrawCalc(amount){
        const selectedATMData = atms.filter(function(e){return e.location === selectedATM});

        let withdrawUnit ={
            aud100: 0,
            aud50: 0,
            aud20: 0,
            aud10: 0,
            auc50: 0,
            auc20: 0,
            auc10: 0,
            auc5: 0
        };

        for (const unit in withdrawUnit){
            if(amount === 0 ) break;
            if(selectedATMData[0][unit]) {

                const temp = parseInt(unit.replace(/[^0-9]/g, '')); //화폐 단위
                let num = 0; // 화폐 갯수

                amount = Math.round(amount * 100) / 100;
                num = Math.floor((unit.includes("aud") ? amount : (amount * 100)) / temp);

                if (num !== 0) {
                    if (selectedATMData[0][unit] >= num) {
                        amount -= num * (unit.includes("aud") ? temp : (temp / 100));
                        withdrawUnit[unit] = num;
                    } else {
                        amount -= selectedATMData[0][unit] * (unit.includes("aud") ? temp : (temp / 100));
                        withdrawUnit[unit] = selectedATMData[0][unit];
                    }
                }
            }
        }
        if(amount === 0)
            return {withdrawalAmount : withdrawUnit, result: true};
        else
            return {result: false};
    }

    const onFinishWithdraw = async (value) =>{
        const withdrawData = withdrawCalc(value.withdrawAmount);
        if(withdrawData.result) {
            updateATM(false, withdrawData.withdrawalAmount);
            errorMessage(1, "success.")
        }
        else {
            errorMessage(1, "Error: The ATM's balance is low.");
        }
    };

    function WithdrawSection(){
        return(
            <Card title="Withdraw" style={{height:'100%'}}>
                <Form
                    labelCol={{ flex: '110px' }}
                    labelAlign="left"
                    onFinish={onFinishWithdraw}
                    form = {withdrawForm}
                    style={{marginTop:'5em'}}
                >
                    <div>Maximum withdrawal amount: <Text strong>$ {withdrawableAmount}</Text></div>
                    <Form.Item  name="withdrawAmount" style={{marginBottom:''}}>
                        <InputNumber prefix='$' style={{width:'100%'}} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block disabled={!selectedATM}
                            style={{marginTop:'5.4em'}}>
                        Withdraw
                    </Button>
                </Form>
            </Card>
        );
    }

    function updateATM(type, data){ // true: deposit, false: withdraw
        let selectedATMData = atms.filter(function(e){return e.location === selectedATM});
        let setData = {...selectedATMData[0]};

        for (let key in setData) {
            if(data[key] !== undefined) {
                type ? setData[key] += data[key]
                    : setData[key] -= data[key];
            }
        }

        dispatch( updateATMAsync(setData))
            .then(response =>{
                dispatch(getATMsAsync());

                if(response.payload)
                    successMessage(type);
                else
                    errorMessage(type, "error.");

                depositForm.resetFields();
            });
    }

    /** ATM List**/
    function cellStyle(text){
        return {
            props: {
                style: {
                    background: parseInt(text) < 5
                        ? parseInt(text) === 0 ? "#e98888" : "#FF9C5AFF"
                        : null,
                }
            },
            children: <div>{text}</div>
        }
    }

    const atmColumn = [
        {
            title: "Location",
            dataIndex: "location",
            key: "location"
        },
        {
            title:"Currency",
            children:[
                {
                    title: "$100",
                    dataIndex: "aud100",
                    key: "aud100",
                    render(text, ) {
                        return cellStyle(text);
                    }
                },
                {
                    title: "$50",
                    dataIndex: "aud50",
                    key: "aud50",
                    render(text, ) {
                        return cellStyle(text);
                    }
                },
                {
                    title: "$20",
                    dataIndex: "aud20",
                    key: "aud20",
                    render(text, ) {
                        return cellStyle(text);
                    }
                },
                {
                    title: "$10",
                    dataIndex: "aud10",
                    key: "aud10",
                    render(text, ) {
                        return cellStyle(text);
                    }
                },
                {
                    title: "50￠",
                    dataIndex: "auc50",
                    key:"auc50",
                    render(text, ) {
                        return cellStyle(text);
                    }
                },
                {
                    title: "20￠",
                    dataIndex: "auc20",
                    key:"auc20",
                    render(text, ) {
                        return cellStyle(text);
                    }
                },
                {
                    title: "10￠",
                    dataIndex: "auc10",
                    key:"auc10",
                    render(text, ) {
                        return cellStyle(text);
                    }
                },
                {
                    title: "5￠",
                    dataIndex: "auc5",
                    key:"auc5",
                    render(text, ) {
                        return cellStyle(text);
                    }
                },
            ]
        },
        {
            title: "Action",
            key: "action"
        }

    ];

    function ATMTable() {
        return (
            <Table
                className="padding15 overflowAuto"
                dataSource={atmsData}
                rowKey="location"
                columns={atmColumn}
                bordered
                pagination={{
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
            />
        );
    }

    /** Main **/
    return (
        <ProtectedLayout>
            <Content style={{ margin: '24px 16px 0'}}>
                <div className="" style={{ padding: 24, minHeight: 360 }}>
                    <Row style={{marginBottom: '2em'}}>
                        <Col span={15} offset={1}>
                            <Card title="Select ATM">
                                <Radio.Group value={selectedATM} onChange={handleSelectedATM}>
                                    <RenderRadioGroup/>
                                </Radio.Group>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={7} offset={1} >
                            <DepositSection/>
                        </Col>
                        <Col span={7} offset={1} >
                            <WithdrawSection/>
                        </Col>
                    </Row>
                    <Row style={{ marginTop:"2em"}}>
                        <Col span={15} offset={1}>
                            <Card title="ATM List">
                                <ATMTable/>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <DepositModal/>
            </Content>
        </ProtectedLayout>
  )
}