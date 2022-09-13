import axios from "axios"
import { ethers } from "ethers"
import { useState } from "react"
import Web3Modal from 'web3modal'
import {  nftaddress, nftmarketaddress  }from '../config'
import {create as ipfsHttpClient} from 'ipfs-http-client'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import { useRouter } from "next/dist/client/router"
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'

import { Buffer } from 'buffer';

// in this component we set the ipfs up to host our nft data of
// file storage 

const ipfsClient = require('ipfs-http-client');
const projectId = '2Ea7u2y4pjc2M2EOlHqsYZjjbBC';
const projectSecret = '8306770f5a010ca746f0f3418d1ef6e3';
const auth =
'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsClient.create({
host: 'ipfs.infura.io',
port: 5001,
protocol: 'https',
headers: {
authorization: auth,
},
});


export default function MintItem(){
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({price: '', name: '', description:''})
    const router = useRouter()

    async function onChange(e) {
        const file = e.target.files[0]
        try {
        const added = await client.add(
            file, {
                progress: (prog) => console.log(`received: ${prog}`)
            })
        const url = `https://kryptobirdz.infura-ipfs.io/ipfs/${added.path}`
        setFileUrl(url)
        } catch (error) {
            console.log('Error uploading file:', error)
        }
    }

    async function createMarket() {
        const {name, description, price} = formInput 
        if(!name || !description || !price || !fileUrl) return 
        // upload to IPFS
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        try {
            const added = await client.add(data)
            const url = `https://kryptobirdz.infura-ipfs.io/ipfs/${added.path}`
            // run a function that creates sale and passes in the url 
            createSale(url)
            } catch (error) {
                console.log('Error uploading file:', error)
            }
    }

    async function createSale(url){
        const web3Modal = new Web3Modal()
        const conenction = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(conenction)
        const signer = provider.getSigner()
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.mintToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer)
        let listringPrice = await contract.getListingPrice()
        listringPrice = listringPrice.toString()

        transaction = await contract.makeMarketItem(nftaddress, tokenId, price, {value: listringPrice})
        await transaction.wait()
        router.push('./')
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input placeholder="Asset Name" className="mt-8 border rounded p-4"
                onChange={e => updateFormInput({...formInput, name: e.target.value})}>
                </input>
                <textarea placeholder="Asset Description" className="mt-2 border rounded p-4"
                onChange={e => updateFormInput({...formInput, description: e.target.value})}>
                </textarea>
                <input placeholder="Asset Price in Eth" className="mt-2 border rounded p-4"
                onChange={e => updateFormInput({...formInput, price: e.target.value})}>
                </input>
                <input type="file" name="Asset" className="mt-4"
                onChange={onChange}>
                </input>{
                fileUrl && (
                    <img className="rounded mt-4" width='250px' src={fileUrl}/>
                )}

                <button onClick={createMarket}
                className='font-bold mt-4 bg-purple-500 text-white rounded p-4 shadow-lg'>
                    Mint NFT
                </button>
            </div>
        </div>
    )

}