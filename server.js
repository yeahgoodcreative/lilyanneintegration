//  File: server.js
//  Package: lilyanneintegration
//
//  Created by Samuel Black on 29/11/2018.
//  Copyright (C) Yeah Good Creative 2018. All Rights Reserved.
//

// Modules
var byDesign = require('./modules/bydesign')
const fs = require('fs');
var express = require('express')
var app = express()
var mustacheExpress = require('mustache-express')

//pulling data from 2pac
let rawdata = fs.readFileSync('2pac.json');  
let stuff = JSON.parse(rawdata);

// Express engine setup
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')


app.get('/', function(req, res) {
    getOrderInfo(stuff.orderNum, function(order) {
        res.render('index', {orders: [order]})
    })  
})

app.listen('8080', function() {
    console.log('Server listening on localhost:8080.')
})

function getOrderInfo(orderId, callback) {
    // Get order info
    var orderInfoPromise = new Promise(function(resolve, reject) {
        byDesign.getOrderInfoV2('', orderId, function(orderInfo) {
            orderInfo = orderInfo['soap:Envelope']['soap:Body'][0]['GetOrderInfo_V2Response'][0]['GetOrderInfo_V2Result'][0]
        
            // Create a current order object
            var currentOrderInfo = {
                repNumber: orderInfo.RepNumber[0],
                customerNumber: orderInfo.CustomerNumber[0],
                status: orderInfo.Status[0],
                orderDate: orderInfo.OrderDate[0],
                billName1: orderInfo.BillName1[0],
                billName2: orderInfo.BillName1[0],
                billStreet1: orderInfo.BillStreet1[0],
                billStreet2: orderInfo.BillStreet1[0],
                billCity: orderInfo.BillCity[0],
                billState: orderInfo.BillState[0],
                billPostalCode: orderInfo.BillPostalCode[0],
                billCountry: orderInfo.BillCountry[0],
                billEmail: orderInfo.BillEmail[0],
                billPhone: orderInfo.BillPhone[0],
                shipName1: orderInfo.ShipName1[0],
                shipName2: orderInfo.ShipName2[0],
                shipStreet1: orderInfo.ShipStreet1[0],
                shipStreet2: orderInfo.ShipStreet2[0],
                shipCity: orderInfo.ShipCity[0],
                shipState: orderInfo.ShipState[0],
                shipPostalCode: orderInfo.ShipPostalCode[0],
                shipGeoCode: orderInfo.ShipGeoCode[0],
                shipCountry: orderInfo.ShipCountry[0],
                shipEmail: orderInfo.ShipEmail[0],
                shipPhone: orderInfo.ShipPhone[0],
                invoiceNotes: orderInfo.InvoiceNotes[0],
                shipMethodId: orderInfo.ShipMethodID[0],
                shipMethod: orderInfo.ShipMethod[0],
                rankPriceType: orderInfo.RankPriceType[0],
                partyId: orderInfo.PartyID[0],
                currencyTypeId: orderInfo.CurrencyTypeID[0],
                giftOrder: orderInfo.GiftOrder[0],
                alternateShipMethodId: orderInfo.AlternateShipMethodID[0]
            }

            // Resolve promise with orderInfo
            resolve(currentOrderInfo)
        })
    })

    // Get order details info
    var orderDetailsInfoPromise = new Promise(function(resolve, reject) {
        byDesign.getOrderDetailsInfoV2('', orderId, function(orderDetailsInfo) {
            orderDetailsInfo = orderDetailsInfo['soap:Envelope']['soap:Body'][0]['GetOrderDetailsInfo_V2Response'][0]['GetOrderDetailsInfo_V2Result'][0]['OrderDetailsResponse'][0]['OrderDetailsResponseV2']
        
            // Array to hold details
            var orderDetailsInfoArray = []
        
            // Iterate through each order detail
            for (detailInfo of orderDetailsInfo) {
                var detailInfoObject = {
                    partyId: detailInfo.PartyID[0],
                    orderDetailId: detailInfo.OrderDetailID[0],
                    productId: detailInfo.ProductID[0],
                    description: detailInfo.Description[0],
                    quantity: detailInfo.Quantity[0],
                    price: detailInfo.Price[0],
                    volume: detailInfo.Volume[0],
                    tax: detailInfo.Tax[0],
                    taxableAmount: detailInfo.TaxableAmount[0],
                    groupOwner: detailInfo.GroupOwner[0],
                    parentOrderDetailId: detailInfo.ParentOrderDetailID[0],
                    warehouseName: detailInfo.WarehouseName[0],
                    warehouseEmail: detailInfo.WarehouseEmail[0],
                    warehousePackSlipLine1: detailInfo.WarehousePackSlipLine1[0],
                    warehousePackSlipLine2: detailInfo.WarehousePackSlipLine2[0],
                    warehousePackSlipLine3: detailInfo.WarehousePackSlipLine3[0],
                    warehousePackSlipLine4: detailInfo.WarehousePackSlipLine4[0],
                    warehousePackSlipLine5: detailInfo.WarehousePackSlipLine5[0],
                    warehousePackSlipLine6: detailInfo.WarehousePackSlipLine6[0],
                    warehousePickupLocation: detailInfo.WarehousePickupLocation[0],
                    warehouseCompanyTaxId: detailInfo.WarehouseCompanyTaxID[0],
                    warehouseIntlCompanyName: detailInfo.WarehouseIntlCompanyName[0],
                    warehousePackSlipTaxTitle: detailInfo.WarehousePackSlipTaxTitle[0],
                    warehousePackSlipTaxPercentage: detailInfo.WarehousePackSlipTaxPercentage[0],
                    packSlipProcessId: detailInfo.PackSlipProcessID[0],
                    volume2: detailInfo.Volume2[0],
                    volume3: detailInfo.Volume3[0],
                    volume4: detailInfo.Volume4[0],
                    otherPrice1: detailInfo.OtherPrice1[0],
                    otherPrice2: detailInfo.OtherPrice2[0],
                    otherPrice3: detailInfo.OtherPrice3[0],
                    otherPrice4: detailInfo.OtherPrice4[0],
                    packSlipProductId: detailInfo.PackSlipProductID[0],
                    packSlipBarcode: detailInfo.PackSlipBarcode[0]
                }

                // Add object to array
                orderDetailsInfoArray.push(detailInfoObject)
            }

            // Resolve promise with orderDetailsInfoArray
            resolve(orderDetailsInfoArray)
        })
    })

    // Get promises results
    Promise.all([orderInfoPromise, orderDetailsInfoPromise]).then(function(results) {

        // Create order object
        var order = {
            orderId: orderId, 
            // dateCreated: '.CreatedDate',
            // dateModified: '.LastModifiedDate',
        }

        // Add data from promises to order object
        order.orderInfo = results[0]
        order.orderDetails = results[1]

        // Return order through callback
        callback(order)
    })
    //Write order info to file 
    /*
    fs.writeFile('biggie.json', orderDetailsInfoArray.text, (err) => {  
        // throws an error, you could also catch it here
        if (err) throw err;
    
        // success case, the file was saved
        console.log('Printed array to file');
    }); */
}