import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VoyagePlan from "./views/pages/VoyagePlan/VoyagePlan";
import MasterRegist from "./views/pages/MasterRegist/MasterRegist"
import MaintenanceTable from "./views/pages/MaintenanceTable/MaintenanceTable"
import MajorEquipmentReport from "./views/pages/MajorEquipmentReport/MajorEquipmentReport"
import FailureReport from "./views/pages/FailureReport/FailureReport"
import DockConstruction from "./views/pages/DockConstruction/DockConstruction"
import SparePartsManagement from "./views/pages/SparePartsManagement/SparePartsManagement"
import CommonLayout from "./CommonLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Authenticator } from '@aws-amplify/ui-react'

import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { fetchAuthSession } from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

import outputs from "../amplify_outputs.json"

const { credentials } = await fetchAuthSession();
const awsRegion = outputs.auth.aws_region;
const functionName = outputs.custom.helloWorldFunctionName;
const client = generateClient<Schema>();


function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState("")
  async function invokeHelloWorld() {
    const { credentials } = await fetchAuthSession()
    const awsRegion = outputs.auth.aws_region
    const functionName = outputs.custom.helloWorldFunctionName
    const labmda = new LambdaClient({ credentials: credentials, region: awsRegion })
    const command = new InvokeCommand({
      FunctionName: functionName,
    });
    const apiResponse = await labmda.send(command);
    if (apiResponse.Payload) {
      const payload = JSON.parse(new TextDecoder().decode(apiResponse.Payload))
      setText(payload.message)
    }
  }
  // const fetchTodos = async () => {
  //   const data = await client.models.Todo.list();
  //   console.log(data);
  // };

  // 各画面へ渡す変更検知用imo
  const [imo, setImo] = useState("");
  return (
    <Authenticator>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<CommonLayout setImo={setImo} />}>
              <Route index element={<VoyagePlan imo={imo} />} />
              <Route path="/VoyagePlan" element={<VoyagePlan imo={imo} />} />
              <Route path="/MaintenanceTable" element={<MaintenanceTable />} />
              <Route path="/MajorEquipmentReport" element={<MajorEquipmentReport />} />
              <Route path="/FailureReport" element={<FailureReport />} />
              <Route path="/DockConstruction" element={<DockConstruction />} />
              <Route path="/SparePartsManagement" element={<SparePartsManagement />} />
              <Route path="/MasterRegist" element={<MasterRegist/>} />
            </Route>
          </Routes>
        </BrowserRouter>
      {/* {({ signOut, user }) => (
        <>
          <main>
            <h1>Hello {user?.username}</h1>
            <button onClick={signOut}>Sign out</button>
          </main>
          <div>
            <a href="https://vitejs.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
            <p>
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
          </div>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
          <p>
            <button onClick={invokeHelloWorld}>invokeHelloWorld</button>
            <div>{text}</div>
            <button onClick={fetchTodos}>todo</button>
            <div>{text}</div>
            
            </p>
        </>
      )} */}
    </Authenticator>
  )
}

export default App
