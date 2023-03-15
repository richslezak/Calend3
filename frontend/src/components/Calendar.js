import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../abis/Calend3.json";

import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from "@devexpress/dx-react-scheduler";

import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentForm,
} from "@devexpress/dx-react-scheduler-material-ui";

import { Box, Button, Slider } from "@material-ui/core";
import SettingsSuggestionIcon from "@mui/icons-material/SettingsSuggest";
import Dialog from "@mui/material/Dialog";
import CircularProgress from "@mui/material/CircularProgress";

const contractAddress = "0x0288F3cb17c85d4e31f8442Ab27baa12170c6964";
const contractAbi = abi.abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(
  contractAddress,
  contractAbi,
  provider.getSigner()
);

// console.log(contract);

const Calendar = (props) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [rate, SetRate] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showSigniture, setShowSigniture] = useState(false);
  const [mined, setMined] = useState(false);
  const [txnHash, setTxnHash] = useState("");

  const getData = async () => {
    const owner = await contract.owner();
    console.log("Owner Account is ", owner.toUpperCase());

    setIsAdmin(owner.toUpperCase() === props.account.toUpperCase());
    console.log("User Account is ", props.account.toUpperCase());

    const rate = await contract.getRate();
    console.log(
      "Rate at load time is ",
      ethers.utils.formatEther(rate.toString())
    );
    SetRate(ethers.utils.formatEther(rate.toString()));

    const appointmentData = await contract.getAppointments();

    console.log("appointments ", appointmentData);

    transformAppointmentData(appointmentData);
  };

  const transformAppointmentData = (appointmentData) => {
    let data = [];
    appointmentData.forEach((appointment) => {
      data.push({
        title: appointment.title,
        startDate: new Date(appointment.startTime * 1000),
        endDate: new Date(appointment.endTime * 1000),
      });
    });

    setAppointments(data);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSliderChange = (event, newValue) => {
    console.log("new value is ", newValue);
    SetRate(newValue);
  };

  const saveAppointment = async (data) => {
    console.log("Appointment Saved ", data);
    const appointment = data.added;
    console.log("Appointment Updated ", appointment);
    const title = appointment.title;
    const startTime = appointment.startDate.getTime() / 1000;
    const endTime = appointment.endDate.getTime() / 1000;

    setShowSigniture(true);
    setShowDialog(true);
    setMined(false);

    try {
      const cost = (((endTime - startTime) / 60) * (rate * 100)) / 100;
      const msg = { value: ethers.utils.parseEther(cost.toString()) };
      let transaction = await contract.createAppointment(
        title,
        startTime,
        endTime,
        msg
      );

      setShowSigniture(false);

      await transaction.wait();

      setMined(true);
      setTxnHash(transaction.hash);
    } catch (error) {
      console.log(error);
    }
  };

  const saveRate = async () => {
    console.log("Rate save is ", ethers.utils.parseEther(rate.toString()));
    const tx = await contract.setRate(ethers.utils.parseEther(rate.toString()));
  };

  const marks = [
    { value: 0.0, label: "Free" },
    { value: 0.02, label: "0.02 ETH/min" },
    { value: 0.04, label: "0.04 ETH/min" },
    { value: 0.06, label: "0.06 ETH/min" },
    { value: 0.08, label: "0.08 ETH/min" },
    { value: 0.1, label: "Expensive" },
  ];

  const Admin = () => {
    return (
      <div id="admin">
        <Box>
          <h3>Set Your Rate</h3>
          <p>Current Rate {parseFloat(rate)} ETH/minute</p>
          <Slider
            defaultValue={parseFloat(rate)}
            step={0.001}
            min={0}
            max={0.1}
            marks={marks}
            valueLabelDisplay="auto"
            onChangeCommitted={handleSliderChange}
          />
          <Button
            id="save-rate-button"
            onClick={saveRate}
            variant={"contained"}
          >
            <SettingsSuggestionIcon />
            Save Configuration
          </Button>
        </Box>
      </div>
    );
  };

  const ConfirmDialog = () => {
    return (
      <Dialog open={true}>
        <div id={"confirmDialog"}>
          <h2>
            {mined && "Appointment Confirmed"}
            {!mined && !showSigniture && "Confirming Your Appointment"}
            {!mined && showSigniture && "Please Sign to Confirm"}
          </h2>
          <div>
            {mined && (
              <p>
                Your appointment has been confirmed and is on the blockchain.{" "}
                <a
                  target="_blank"
                  href={`https://goerli.etherscan.io/tx/${txnHash}`}
                >
                  View on Etherscan
                </a>
              </p>
            )}
            {!mined && !showSigniture && (
              <p>
                Please wait while we confirm your appointemnt on the blockchain
              </p>
            )}
            {!mined && showSigniture && (
              <p>Please sign the transaction to confirm your appointemnt</p>
            )}
          </div>
          <div className="spinner">{!mined && <CircularProgress />}</div>
          <div>
            {mined && (
              <Button
                onClick={() => {
                  setShowDialog(false);
                  getData();
                }}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    );
  };

  return (
    <div>
      <div>
        {isAdmin && (
          <Button
            id="admin-button"
            onClick={() => setShowAdmin(!showAdmin)}
            variant="contained"
            startIcon={<SettingsSuggestionIcon />}
          >
            Toggle Admin Pannel
          </Button>
        )}
      </div>
      {showAdmin && <Admin />}
      <div id="calendar">
        <Scheduler data={appointments}>
          <ViewState />
          <EditingState onCommitChanges={saveAppointment} />
          <IntegratedEditing />
          <WeekView startDayHour={9} endDayHour={19} />
          <Appointments />
          <AppointmentForm />
        </Scheduler>
      </div>
      {showDialog && <ConfirmDialog />}
    </div>
  );
};

export default Calendar;
