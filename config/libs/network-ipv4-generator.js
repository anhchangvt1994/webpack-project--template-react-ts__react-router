//=======================================
// NOTE - generate External IP
//=======================================
const os = require("os");
const OSNetworkInterfaces = os.networkInterfaces();
const Ethernet =
  OSNetworkInterfaces.Ethernet || Object.values(OSNetworkInterfaces);

let IPV4_ADDRESS = null;

if (Ethernet) {
  let ethernetFormatted = Ethernet;

  if (ethernetFormatted[0].length) {
    let tmpEthernetFormatted = [];

    ethernetFormatted.forEach(function (EthernetItem) {
      tmpEthernetFormatted = tmpEthernetFormatted.concat(EthernetItem);
    });

    ethernetFormatted = tmpEthernetFormatted;
  }

  ethernetFormatted.some(function (ethernetItem) {
    const ethernetItemInfo =
      ethernetItem.family &&
      /ipv4|4/.test(ethernetItem.family?.toLowerCase?.() ?? ethernetItem.family)
        ? ethernetItem
        : null;

    if (
      ethernetItemInfo &&
      ethernetItemInfo.address !== "127.0.0.1" &&
      (ethernetItemInfo.address.includes("192") ||
        ethernetItemInfo.address.includes("172"))
    ) {
      IPV4_ADDRESS = ethernetItemInfo.address;
      return true;
    }
  });
}

module.exports = { IPV4_ADDRESS };
