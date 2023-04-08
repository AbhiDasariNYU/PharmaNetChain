'use strict';

class utils
{
    /**
     * This function is called by the transactions defined inside the smart contract to validate the initiator of the transaction
     * @param {*} ctx The transaction context
     * @param {*} initiator This variable is used to store the organisation name of the initiating peer
     */

	validateInitiator(ctx, initiator)
	{
		const initiatorID = ctx.clientIdentity.getX509Certificate();
		console.log(initiator); 
		if(initiatorID.issuer.organizationName.trim() !== initiator)
		{
				throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
		}
    }

}
module.exports=utils;
 