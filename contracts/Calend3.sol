// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Calend3 {
    uint rate;
    address payable public owner;

    struct Appointment {
        string title;
        address attendee;
        uint startTime;
        uint endTime;
        uint ammountPaid;
    }

    Appointment[] appointments;

    constructor() {
        owner = payable(msg.sender);
    }

    function getRate() public view returns(uint) {
        return rate;
    }

    function setRate(uint _rate) public {
        require(msg.sender == owner, "Only the owner can set the rate");
        rate = _rate;
    }

    function getAppointments() public view returns (Appointment[] memory) {
        return appointments;
    }

    function createAppointment(string memory title, uint startTime, uint endTime) public payable {
        Appointment memory appointment;
        appointment.title = title;
        appointment.startTime = startTime;
        appointment.endTime = endTime;
        appointment.ammountPaid = ((endTime - startTime)/60) * rate;

        require(msg.value >= appointment.ammountPaid, "Not enough ether to make an appointment");

        (bool success,) = owner.call{value: msg.value}("");
        require(success, "Failed to send Ether");

        // appointment.attendee = msg.sender;

        appointments.push(appointment);
    }
}           