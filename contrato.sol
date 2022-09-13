//COMPILAR EN REMIX Y DESPLEGAR EN BLOCKCHAIN
// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721Enumerable, Ownable {
  enum Color {Black, White, Purple, Cyan, Yellow, Orange}
  uint public SUPPLY;
  uint public MAX_SUPPLY = 100;
  uint public PRICE = 0.1 ether;
  mapping (uint=>Color) public token_color;
  mapping (Color=>string) public color_uri;

  constructor() ERC721("Itaaj Activos en Movimiento", "ITAJ") {}

  function tokenURI(uint256 token_id) public view virtual override returns (string memory) {
    require(_exists(token_id), "ERC721Metadata: URI query for nonexistent token");
    return color_uri[token_color[token_id]];
  }

  function setTokenURIs(string[] memory uris) public onlyOwner
  {
    color_uri[Color.Black]  = uris[0];
    color_uri[Color.White]  = uris[1];
    color_uri[Color.Purple] = uris[2];
    color_uri[Color.Cyan]   = uris[3];
    color_uri[Color.Yellow] = uris[4];
    color_uri[Color.Orange] = uris[5];
  }

  function setTokenColor(uint token_id, Color color) public
  {
    require(msg.sender == ownerOf(token_id), "Must be token owner.");
    token_color[token_id] = color;
  }

  function mint() public payable
  {
    require(msg.value >= PRICE,  "Must pay price.");
    require(SUPPLY < MAX_SUPPLY, "Max supply must not be reached.");
    _mint(msg.sender, SUPPLY);
    SUPPLY  += 1;
  }

  function withdraw() public
  {
    (bool sent, bytes memory data) = address(owner()).call{value: address(this).balance}("");
    require(sent, "Failed to send Ether");
    data;
  }

  function setPrice(uint _price) public onlyOwner
  {
    PRICE = _price;
  }

  function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable)
  {
    super._beforeTokenTransfer(from, to, tokenId);
  }
}
