import React, {useState, useEffect } from 'react';
import {TextField , Button } from '@mui/material';
import Task from './Task';
import './App.css';

import { TaskContractAddress } from './config.js';
import {ethers} from 'ethers';
import TaskAbi from './utils/TaskContract.json'


function App() {
  const [tasks,setTasks]=useState([]);
  const [input, setInput]=useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  
  const getAllTasks = async() => {
  try {
    const {ethereum} = window

    if(ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TaskContract = new ethers.Contract(
        TaskContractAddress,
        TaskAbi.abi,
        signer
      )

      let allTasks = await TaskContract.getMyTasks();
      setTasks(allTasks);
    } else {
      console.log("Ethereum object doesn't exist");
    }
  } catch(error) {
    console.log(error);
  }
}
  
  useEffect(() => {
      getAllTasks()
    },[]);
    
    // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }
      let chainId = await ethereum.request({ method: 'eth_chainId'})
      console.log('Connected to chain:' + chainId)

      const GoerlibyChainId = '0x5'

      if (chainId !== GoerlibyChainId) {
        alert('You are not connected to the Goerli Testnet!')
        return
      } else {
        setCorrectNetwork(true);
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log('Error connecting to metamask', error)
    }
  }  
    
  const addTask= async (e)=>{
    e.preventDefault();

    let task = {
      'taskText': input,
      'isDeleted': false
    };

    try {
      const {ethereum} = window

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        )
        if(input !== '') {
        TaskContract.addTask(task.taskText, task.isDeleted)
        .then(response => {
          setTasks([...tasks, task]);
          console.log("Completed Task");
        })
        .catch(err => {
          console.log("Error occured while adding a new task");
        });
        ;
      }else{
        alert('Please enter a task to add');
      }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch(error) {
      console.log("Error submitting new Tweet", error);
    }

    setInput('')
  };
  
  const deleteTask = key => async() => {
    console.log(key);

    // Now we got the key, let's delete our tweet
    try {
      const {ethereum} = window

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        )

        await TaskContract.deleteTask(key, true);
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log("Ethereum object doesn't exist");
      }

    } catch(error) {
      console.log(error);
    }
  }

  return (
    <div>
{currentAccount === '' ? (
  <center><button
  className='button'
  onClick={connectWallet}
  >
  Tap to Connect Metamask Wallet
  </button></center>
  ) : correctNetwork ? (
    <div className="App">
      <h2>ToDo dApp</h2>
      <form>
         <TextField id="outlined-basic" label="Enter Your Todos" variant="outlined" style={{margin:"0px 6px"}} size="small" value={input}
         onChange={e=>setInput(e.target.value)} />
        <Button variant="contained" color="primary" onClick={addTask}  >Add Task</Button>
      </form>
      <ul>
          {tasks.map(item=> 
            <Task 
              key={item.id} 
              taskText={item.taskText} 
              onClick={deleteTask(item.id)}
            />)
          }
      </ul>
    </div>
  ) : (
  <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
  <div>----------------------------------------</div>
  <div>Please connect to the Goerli Testnet</div>
  <div>and reload the page</div>
  <div>----------------------------------------</div>
  </div>
)}
</div>
  );
}

export default App;