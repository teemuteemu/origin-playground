import { post } from 'utils/ipfsHash'

import getOffer from '../resolvers/helpers/getOffer'

/*
mutation makeOffer($listingID: String, $offerID: String) {
  acceptOffer(listingID: $listingID, offerID: $offerID)
}
{
  "listingID": "0",
  "offerID": "0"
}
*/

async function acceptOffer(_, data, context) {
  return new Promise(async (resolve, reject) => {
    const ipfsHash = await post(context.contracts.ipfsRPC, data)
    context.contracts.marketplace.methods
      .acceptOffer(data.listingID, data.offerID, ipfsHash)
      .send({
        gas: 4612388,
        from: data.from || web3.eth.defaultAccount
      })
      .on('receipt', receipt => {
        context.contracts.marketplace.eventCache.updateBlock(receipt.blockNumber)
      })
      .on('confirmation', async (confirmations) => {
        if (confirmations === 1) {
          resolve(getOffer(context.contracts.marketplace, {
            listingId: data.listingID,
            idx: data.offerID
          }))
        }
      })
      .then(() => {})
      .catch(reject)
  })
}

export default acceptOffer
