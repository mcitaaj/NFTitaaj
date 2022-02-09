const NETWORK_ID = 5
const CONTRACT_ADDRESS = "0x809FFcE4eC2Ac7E14F08d31b4564303AcaEa34f6"
const JSON_CONTRACT_ABI_PATH = "./ContractABI.json"
var contract
var accounts
var web3
var balance
var SUPPLY
var MAX_SUPPLY
var nft_ids = []
var token_colors = []
var PRICE

function metamaskReloadCallback()
{
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se cambió el account, refrescando...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se el network, refrescando...";
    window.location.reload()
  })
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Porfavor conéctate a Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

const getContract = async (web3) => {
  const response = await fetch(JSON_CONTRACT_ABI_PATH);
  const data = await response.json();

  const netId = await web3.eth.net.getId();
  contract = new web3.eth.Contract(
    data,
    CONTRACT_ADDRESS
    );
  return contract
}

async function loadDapp() {
  metamaskReloadCallback()
  document.getElementById("web3_message").textContent="Por favor conéctate a Metamask"
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          contract = await getContract(web3);
          await window.ethereum.request({ method: "eth_requestAccounts" })
          accounts = await web3.eth.getAccounts()
          balance = await contract.methods.balanceOf(accounts[0]).call()
          MAX_SUPPLY = await contract.methods.MAX_SUPPLY().call()
          SUPPLY = await contract.methods.SUPPLY().call()
          PRICE = await contract.methods.PRICE().call()
          for(i=0; i<balance; i++)
          {
            nft_ids.push(await contract.methods.tokenOfOwnerByIndex(accounts[0],i).call())
          }
          console.log(nft_ids)
          for(i=0; i<nft_ids.length; i++)
          {
            token_color = await contract.methods.token_color(nft_ids[i]).call()
            token_colors.push(token_color)
            addColorSelector(token_color, nft_ids[i])
          }
          console.log(token_colors)
          if(balance == 1)
            document.getElementById("web3_message").textContent="Tienes 1 token"
          else
            document.getElementById("web3_message").textContent="Tienes " + balance + " tokens"
          document.getElementById("available_message").textContent="" + (MAX_SUPPLY-SUPPLY) + "/" + MAX_SUPPLY + " disponibles (Precio: " + web3.utils.fromWei(PRICE) + " ETH)"
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Por favor conectate a Goerli";
      }
    });
  };
  awaitWeb3();
}

function getTokenUrl(token_color)
{
  if(token_color==0)
    return "https://itaaj.com/images/Black.png"
  if(token_color==1)
    return "https://itaaj.com/images/White.png"
  if(token_color==2)
    return "https://itaaj.com/images/Purple.png"
  if(token_color==3)
    return "https://itaaj.com/images/Cyan.png"
  if(token_color==4)
    return "https://itaaj.com/images/Yellow.png"
  if(token_color==5)
    return "https://itaaj.com/images/Orange.png"
}

function addColorSelector(token_color, token_id)
{
  var parent = document.getElementById("color_selectors");
  var column = document.createElement("column");
  column.className = "column is-one-quarter-desktop"
  var card = document.createElement("div");
  card.className = "card"
  column.appendChild(card);
  parent.appendChild(column);

  //Img
  var img = document.createElement("img");
  var img_field_div = document.createElement("div");
  var figure = document.createElement("figure");
  img_field_div.className = "card-image"
  figure.className = "image is-150by150"
  img.src = getTokenUrl(token_color);
  img.width = "150"
  img_field_div.appendChild(figure);
  figure.appendChild(img);
  card.appendChild(img_field_div);

  //Card content
  var card_content = document.createElement("div");
  card_content.className = "card-content"
  card.appendChild(card_content);

  //Title
  var title = document.createElement("p");
  title.className = "title"
  title.innerHTML = "Itaaj Token #" + token_id
  card_content.appendChild(title);

  //Select
  var array = ["Black", "White", "Purple", "Cyan", "Yellow", "Orange"];
  var field = document.createElement("div");
  field.className = "field"
  var label = document.createElement("label");
  label.className = "label"
  label.innerHTML = "Color"
  var control = document.createElement("div");
  control.className = "control"
  var select_div = document.createElement("div");
  select_div.className = "select"
  var select_list = document.createElement("select");
  select_div.appendChild(select_list);  
  select_list.id = "color_select_" + token_id;
  field.appendChild(label); 
  field.appendChild(control); 
  control.appendChild(select_div); 
  card_content.appendChild(field); 
  for (var i = 0; i < array.length; i++) {
      var option = document.createElement("option");
      option.value = ""+i;
      option.text = array[i];
      select_list.appendChild(option);
  }

  //Button
  var btn_field_div = document.createElement("footer");
  btn_field_div.className = "card-footer"
  var btn = document.createElement("a");
  btn.innerHTML = "Cambia el color";
  btn.className = "card-footer-item btn btn-primary"
  btn.onclick = function () {
    var color_select_element = document.getElementById("color_select_" + token_id);
    var selected_color = color_select_element.options[color_select_element.selectedIndex].value;
    setColor(token_id, selected_color)
  };
  btn_field_div.appendChild(btn); 
  card.appendChild(btn_field_div);
}

const mint = async () => {
  const result = await contract.methods.mint()
    .send({ from: accounts[0], gas: 0, value: PRICE })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minteando...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Éxito! El minteo se ha completado.";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

const setColor = async (token_id, color) => {
  const result = await contract.methods.setTokenColor(token_id, color)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minteando...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Éxito! Has cambiado el color.";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

/*
await setTokenURIs(
  ["https://raw.githubusercontent.com/mcitaaj/NFTitaaj/main/Black.json",
   "https://raw.githubusercontent.com/mcitaaj/NFTitaaj/main/White.json",
   "https://raw.githubusercontent.com/mcitaaj/NFTitaaj/main/Purple.json",
   "https://raw.githubusercontent.com/mcitaaj/NFTitaaj/main/Cyan.json",
   "https://raw.githubusercontent.com/mcitaaj/NFTitaaj/main/Yellow.json",
   "https://raw.githubusercontent.com/mcitaaj/NFTitaaj/main/Orange.json"])
*/
const setTokenURIs = async (uris) => {
  const result = await contract.methods.setTokenURIs(uris)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Estableciendo los URIs...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Éxito! Has cambiado los URIs.";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

loadDapp()