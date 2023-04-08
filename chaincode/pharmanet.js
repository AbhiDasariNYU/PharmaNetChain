'use strict';

const{Contract}=require('fabric-contract-api');
const utilsclass = require('./utils');
class pharmanet extends Contract{
constructor(){

super('org.pharma-network.pharmanet');
  global.utils = new utilsclass();
  //These Global variables are used to store the organisation names of the organisations participating in the network.
	global.manufacturerOrg = 'manufacturer.pharma-network.com';
	global.retailerOrg = 'retailer.pharma-network.com';
	global.distributorOrg='distributor.pharma-network.com';
	global.consumerOrg='consumer.pharma-network.com';
	global.transporterOrg='transporter.pharma-network.com';

}

async instantiate(ctx){
	console.log('Phramanet Contract has been instantiated');
	}
	
//Entity Registration for Manufacturer or Distributor or Retailer
async registerCompany (ctx,companyCRN, companyName, Location, organisationRole){
	const companyKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company',[companyCRN]);
	const companyId=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.id',[companyCRN,companyName]);
	let hierarchyKeyAssign;
	if(organisationRole=='manufacturer')
	{
		hierarchyKeyAssign=1;
	}
	else if(organisationRole=='distributor')
	{
		hierarchyKeyAssign=2;
	}
	else if( organisationRole=='retailer')
	{
		hierarchyKeyAssign=3;
	}
	
	let newCompanyObject={
		companyId: companyId,
		companyName: companyName,
		companyLocation: Location,
		organisationRole: organisationRole,
		hierarchyKey:hierarchyKeyAssign,
	
	};
	// writing the new objects to the ledger
	let companyBuffer =Buffer.from(JSON.stringify(newCompanyObject));
	await ctx.stub.putState(companyKey,companyBuffer);
	return newCompanyObject;
}

//Drug Registration by Manufacturer
async addDrug (ctx,drugName, serialNo, mfgDate, expDate, companyCRN){
	const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug',[drugName,serialNo]);
	//add DrugManufacturer,DrugOwner, Drugshipment
	const companyKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company',[companyCRN]);
	
	utils.validateInitiator(ctx,manufacturerOrg);
	var shipmentList=[];
	let newDrugObject={
		productID: DrugKey,
		drugName: drugName,
		drugManufacturer: companyKey,// key of the manufacturer
		drugManufacturingDate: mfgDate,
		drugExpiryDate: expDate,
		drugOwner:companyKey,//key of the owner
		drugShipment:shipmentList,
		
	
	};
	// writing the new objects to the ledger
	let drugBuffer =Buffer.from(JSON.stringify(newDrugObject));
	await ctx.stub.putState(drugKey,drugBuffer);
	return newDrugObject;
	
}

//Transfer Drug From Company to company Purchase order
async createPO (ctx,buyerCRN, sellerCRN, drugName, quantity){
	// giving access to only retailer or distributor
    if(initiatorID.issuer.organizationName.trim() == retailerOrg || initiatorID.issuer.organizationName.trim() == distributorOrg ){
	
	
	const poKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.po',[buyerCRN,drugName]);
	const buyerKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company',[buyerCRN]);
	const sellerKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company',[sellerCRN]);
	//getting buyer details
	let buyerBuffer= await ctx.stub.getState(buyerKey).catch(err => console.log(err));
	//getting seller details
	let sellerBuffer= await ctx.stub.getState(sellerKey).catch(err => console.log(err));
	
	const buyer= JSON.parse(buyerBuffer.toString());
	const seller= JSON.parse(sellerBuffer.toString());
	//making sure that retailers buy only from distributor and distributors buy only from manufacturer
	if(buyer.hierarchyKey+1==seller.hierarchyKey){
	let newPoObject={
		drugName: drugName,
		quantity: quantity,
		buyer: buyerKey,
		seller: sellerKey,
  }
	let poBuffer =Buffer.from(JSON.stringify(newPoObject));
	await ctx.stub.putState(poKey,poBuffer);
	return newPoObject;
    }
}
else{
	console.log("only retailer or distributor can access this function")
    }
}
// creating ashipment for transfer of drugs
async createShipment (ctx,buyerCRN, drugName, listOfAssets, transporterCRN ){
    const initiatorID = ctx.clientIdentity.getX509Certificate();
		
	
	
	
	const poKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.po',[buyerCRN,drugName]);
	let poBuffer= await ctx.stub.getState(poKey).catch(err => console.log(err));
	const po= JSON.parse(poBuffer.toString());
	
	let AssetArr= listOfAssets.split(',');
	
	
	//validating the quantity with list
	if(AssetArr.length==po.quantity){
		
	//validate the ids  
	let flag=0
	for(i=0;i<AssetArr.length;i++){
		let name=AssetArr[i].split(':')[0]; // taking the name of the drug
		let version=AssetArr[i].split(':')[1]; // taking the serial number
		
		
		const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug',[name,version]);// generating the composite key 
		let drugBuffer= await ctx.stub.getState(drugKey).catch(err=>console.log(err));
		const drug= JSON.parse(drugBuffer.toString());
		
		
		let creatorKey= drug.drugOwner;
	
		const drug= JSON.parse(drugBuffer.toString());
		//checking whether all the drugs are registered
		if(drug== undefined){
			console.log("The Drug Asset is not registered");
			throw new Error('Invalid Asset, The Drug Asset is not registered');
		}
	else{
			flag=flag+1;
		}
	      }
		  
		
	if(flag==AssetArr.length){
	
	     const shipmentKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment',[buyerCRN,drugName]);
		 
		 const transporterKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company',[transporterCRN]);
		 let transporterBuffer= await ctx.stub.getState(transporterKey).catch(err => console.log(err));
	     const transporter= JSON.parse(drugBuffer.toString());
		 
	     let statusAssign='in-transit';
	     let newShipmentObject={
		  creator: creatorKey ,
		  assets: listOfAssets,
		  transporter: transporter.companyId,
		  shipmentStatus: statusAssign,
         };
         
        let shipmentBuffer =Buffer.from(JSON.stringify(newShipmentObject));
	    await ctx.stub.putState(shipmentKey,shipmentBuffer);
	    return newShipmentObject;
	     }
	else{
	 	console.log("Found  Drug Asset which is not registered");
         }
    }
}

// updating shipment on delivery by transporter
async updateShipment(ctx,buyerCRN, drugName, transporterCRN){
    utils.validateInitiator(ctx,transporterOrg);
    const shipmentKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment',[buyerCRN,drugName]);
    //fetching the shipment details
    let shipmentBuffer= await ctx.stub.getState(shipmentKey).catch(err => console.log(err));
    const shipment= JSON.parse(shipmentBuffer.toString());


    var status = "Delivered";
    var AssetArr1= shipment.assets;
    //updating the status
    let newShipmentObject={
        creator: shipment.creator,
        assets: shipment.assets,
        transporter: shipment.transporter,
        shipmentStatus: status,
    };

    var i=0;

    //adding the shipment details to the drugshipment list
    for(i=0;i<AssetArr1.length;i++){
		let name=AssetArr[i].split(':')[0]; // taking the name of the drug
		let version=AssetArr[i].split(':')[1]; // taking the serial number
		
		
		const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug',[name,version]);// generating the composite key 
		let drugBuffer= await ctx.stub.getState(drugKey).catch(err=>console.log(err));
        const drug= JSON.parse(drugBuffer.toString());
        
        let newDrugObject={
            productID: drug.productID,
            drugName: drug.drugName,
            drugManufacturer: drug.drugManufacturer,
            drugManufacturingDate: drug.drugManufacturingDate,
            drugExpiryDate: drug.drugExpiryDate,
            drugOwner: drug.drugOwner,
            //pushing the shipmentkey to the list
            drugShipment: drug.shipmentList.push(shipmentKey),

        };
    }
    let shipmentBuffer =Buffer.from(JSON.stringify(newShipmentObject));
	await ctx.stub.putState(shipmentKey,shipmentBuffer);
    


    let drugBuffer =Buffer.from(JSON.stringify(newDrugObject));
	await ctx.stub.putState(drugKey,drugBuffer);
    
    return newShipmentObject;
    


}
// selling the drug to the consumer
async retailDrug (ctx,drugName, serialNo, retailerCRN, customerAadhar){
    //getting the drug key
	const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug',[drugName,serialNo]);
	
	//change the ownership to aadhar of the buyer
	utils.validateInitiator(ctx,retailerOrg);
	let drugBuffer= await ctx.stub.getState(drugKey).catch(err => console.log(err));
    const drug= JSON.parse(drugBuffer.toString());
    
    // updating the drug details with aadhar
	let newDrugObject={
		productID: drug.DrugKey,
		drugName: drug.drugName,
		drugManufacturer: drug.companyKey,// key of the manufacturer
		drugManufacturingDate: drug.mfgDate,
		drugExpiryDate: drug.expDate,
		drugOwner:customerAadhar,//key of the owner
		drugShipment:drug.drugShipment,
		
	
	};
	let drugBuffer =Buffer.from(JSON.stringify(newDrugObject));
	await ctx.stub.putState(drugKey,drugBuffer);
	return newCompanyObject;
}

//View Lifecycle
async viewHistory (ctx,drugName, serialNo){
    //getting the drug key
    const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug',[drugName,serialNo]);

    //getting the history for the key
    let iterator = await ctx.stub.getHistoryForKey(drugKey);
    let result = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value) {
        
        const obj = JSON.parse(res.value.value.toString('utf8'));
        result.push(obj);
      }
      res = await iterator.next();
    }
    await iterator.close();
    return result;

    }
    



// view the current state of the drug
async viewDrugCurrentState (ctx,drugName, serialNo){
    
	const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug',[drugName,serialNo]);
    //getting the current state
    let drugBuffer = await ctx.stub.getState(drugKey).catch(err=>console.log(err));
	return JSON.parse(drugBuffer.toString());
}

}










