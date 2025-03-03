import {
  extractUEXData,
  generateStarSystemChunks,
  getExtractionMaps,
  processDataForEmbedding,
  UEXPlatformDataExtractionObject,
} from "..";
import { promises as fsPromises } from "fs";

const readFileName = "./output/uex-data-2025-03-02.json";
async function main() {
  try {
    // Extract data
    // const extractedData = await extractUEXData();

    // // Save extracted data to a file as backup
    // await fsPromises.writeFile(
    //   `./output/uex-data-${new Date().toISOString().split("T")[0]}.json`,
    //   JSON.stringify(extractedData, null, 2)
    // );
    const rawData = await fsPromises.readFile(readFileName, "utf-8");
    const parsedData = JSON.parse(rawData);
    const extractedData = UEXPlatformDataExtractionObject.parse(parsedData);
    const maps = getExtractionMaps(extractedData);
    const starSystemChunks = generateStarSystemChunks(extractedData, maps);
    console.log(JSON.stringify(starSystemChunks, null, 2));
    // Process and upload to Pinecone
    // const result = await processAndUploadData(extractedData);
    // const allChunks = await processDataForEmbedding(extractedData);
    // await fsPromises.writeFile(
    //   `./output/embedding-chunks-${
    //     new Date().toISOString().split("T")[0]
    //   }.json`,
    //   JSON.stringify(allChunks, null, 2)
    // );

    console.log(
      `Complete pipeline execution successful. Writted to ${`./output/uex-data-${
        new Date().toISOString().split("T")[0]
      }.json`}`
    );
  } catch (error) {
    console.error("Pipeline execution failed:", JSON.stringify(error, null, 2));
  }
}

main();
