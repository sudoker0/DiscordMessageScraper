import { MessageProperties, HandleExistingData, HandleIncompleteData } from "./enum.js"
import { GuildChannelList } from "./types.js"

//? List of channels in servers to scrape the messages from
//* Examples:
/*
{
    "guild_id": "123123123123123", //* server to scrape the messages
    "channels": [ //* channels within the server to scrape the messages
        "456456456456",
        "456456456456",
        "456456456456",
    ]
},
{
    "guild_id": "789789789789789",
    "channels": [
        "123123123123",
        "123123123123",
        "123123123123",
    ]
}
 */
const ID: GuildChannelList = [

]

//? How should the program handle existing scraped data
//* NOTHING: Do nothing (the program will ignore and continue)
//* DELETE: Delete the existing scraped data
const HANDLE_EXISTING_DATA: HandleExistingData = HandleExistingData.NOTHING

//? How should the program handle scraped data that haven't been fully downloaded
//* NOTHING: Do nothing (the program will ignore and continue)
//* DELETE: Delete the incomplete data
const HANDLE_INCOMPLETE_DATA: HandleIncompleteData = HandleIncompleteData.DELETE

//? Delay between each requests
const DELAY: number = 100

//? Directory to put the scraped data (relative to the root of the program)
const DATA_DIR: string = "./data"

//? Amount of retries if the request to the API fail
const RETRY_AMOUNT: number = 10

//? Delay between each retries
const RETRY_DELAY: number = 1000

//? Maximum amount of message data to write to each JSON file **multiplied by 100**
//? (so if the value is 100, then the data will be splitted into chunk of 10000 messages)
//! Warning: Setting the value too high (like over 1000) can cause problem
const SPLIT_EVERY_FACTOR: number = 100

//? Should the JSON be pretty printed?
const BEAUTIFY: boolean = false

//? List of message properties to include into the data dump
const INCLUDE_PROPERTIES: MessageProperties[] = [
    MessageProperties.AUTHOR,
    MessageProperties.CHANNEL_ID,
    MessageProperties.CONTENT,
    MessageProperties.EDITED_TIMESTAMP,
    MessageProperties.ID,
    MessageProperties.REACTIONS,
    MessageProperties.TIMESTAMP,
]

//? List of message properties to exclude in the data dump
//* NOTE: The program will first include the properties listed above, then exclude those properties.
//*       So to only exclude some properties, set the `INCLUDE_PROPERTIES` to have `MessageProperties.All`,
//*       then put all the properties you want to exclude down below.
const EXCLUDE_PROPERTIES: MessageProperties[] = [

]

export {
    BEAUTIFY,
    DATA_DIR,
    DELAY,
    ID,
    INCLUDE_PROPERTIES,
    EXCLUDE_PROPERTIES,
    RETRY_AMOUNT,
    SPLIT_EVERY_FACTOR,
    RETRY_DELAY,
    HANDLE_EXISTING_DATA,
    HANDLE_INCOMPLETE_DATA
}