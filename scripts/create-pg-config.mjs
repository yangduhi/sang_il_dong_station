import dns from "node:dns";

function resolveWithIpv6Fallback(hostname, callback) {
  dns.resolve6(hostname, (resolveError, ipv6Addresses) => {
    if (!resolveError && ipv6Addresses?.length) {
      callback(null, ipv6Addresses[0], 6);
      return;
    }

    dns.lookup(hostname, (lookupError, address, family) => {
      callback(lookupError, address, family);
    });
  });
}

export function createPgConfig(connectionString) {
  return {
    connectionString,
    lookup(hostname, options, callback) {
      if (typeof options === "function") {
        resolveWithIpv6Fallback(hostname, options);
        return;
      }

      resolveWithIpv6Fallback(hostname, callback);
    }
  };
}
