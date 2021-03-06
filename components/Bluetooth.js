import React, { Component } from 'react';
import { BleManager } from "react-native-ble-plx";
import {Buffer} from 'buffer';
import consts  from '../Const/services_characteristics';
import { tsConstructSignatureDeclaration } from '@babel/types';
export default class Bluetooth{

    

    constructor(check_connection)
    {   this.device = null;
        this.check_connection = check_connection;
        this.manager = new BleManager();
        this.devices = this.devices.bind(this);
        this.pulse = 100;
    }

    devices(){

        this.manager.startDeviceScan(null,null,(error,device)=>{
            if(error){
                return error.message;
            }
            if(device.name == "Mi Smart Band 4"){
                device.connect().then((device)=>{
                    this.device = device;
                    this.check_connection(true);
                    this.manager.stopDeviceScan();
                    this.start_scan();
                })
            }


        })
    }
    start_scan(){
        this.check_pulse();
        var values = [21,1,1];
        var encryptedCredentials = new Buffer(values).toString("base64");


        this.device.discoverAllServicesAndCharacteristics()
        .then((device)=> {
            return this.manager.writeCharacteristicWithResponseForDevice(device.id,consts.HEAR_RATE_SERVICE_GUID,consts.HEART_RATE_MEASUREMENT_POINT,encryptedCredentials);
        })
        


    }
    check_pulse(){
        this.device.discoverAllServicesAndCharacteristics()
            .then((device) => {
            this.manager.monitorCharacteristicForDevice(
            device.id,
            consts.HEAR_RATE_SERVICE_GUID,
            consts.HEART_RATE_MEASUREMENT_VALUE,
            (error, characteristic) => {
                if (characteristic && characteristic.value) {
                
                // is 1 then 2 bytes).
                    let heartRate = -1;
                    let decoded = Buffer.from(characteristic.value, 'base64');
                    let firstBitValue = decoded.readInt8(0) & 0x01;
                    if (firstBitValue == 0) {
                // Heart Rate Value Format is in the 2nd byte
                        heartRate = decoded.readUInt8(1);
                        this.pulse = heartRate
                } else {
                    heartRate = (decoded.readInt8(1) << 8) + decoded.readInt8(2);
                    this.pulse = heartRate
                }
            }
            })

        })
    }
}