import client from "./services/elasticsearch.service.js";

const test = async () => {
  try {
    const res = await client.info();
    console.log("ES CONNECTED:", res);
  } catch (err) {
    console.error("ES ERROR:", err);
  }
};

test();
