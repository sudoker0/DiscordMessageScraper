import dotenv from "dotenv"
import fs from "fs/promises"
import { join, dirname } from "path"
import { fileURLToPath } from 'url'
import chalk from "chalk"
import cliProgress from "cli-progress"
import { constants } from "fs"

import * as C from "./config.js"
import { GuildChannelData, Message, Channel } from "./types.js"
import {
    MessageProperties,
    HandleExistingData,
    HandleIncompleteData,
    ChannelType
} from "./enum.js"
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const CHUNK_AMOUNT = 100
const CHAT_URL_TEMPLATE = `https://discord.com/api/v9/channels/$CHANNEL/messages?after=$AFTER&limit=${CHUNK_AMOUNT}`
const TOTAL_MSG_URL_TEMPLATE = `https://discord.com/api/v9/guilds/$GUILD/messages/search?channel_id=$CHANNEL`
const CHANNEL_LIST_TEMPLATE = `https://discord.com/api/v9/guilds/$GUILD/channels`

const API_KEY = process.env["API_KEY"] || ""
const LOG = (indent: number, str: string, indent_length = 2) => console.log(str.padStart(str.length + indent * indent_length, " "))
const ROOT_DATA_DIR = join(__dirname, "../data")
const HEADER_DATA = {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US",
        "authorization": API_KEY,
    },
    "method": "GET",
}
const SUPPORTED_CHANNEL = [
    ChannelType.GUILD_TEXT,
    ChannelType.GUILD_VOICE
]

//? any also the same, but with || instead of &&
function all(iterable: boolean[]) {
    return iterable.reduce((acc, curr) => acc && curr, true)
}

async function checkConfig() {
    var typeCheck = [
        typeof C.BEAUTIFY == "boolean",
        typeof C.DELAY == "number",
        typeof C.RETRY_AMOUNT == "number",
        typeof C.RETRY_DELAY == "number",
        typeof C.SPLIT_EVERY_FACTOR == "number",
        typeof C.ID == "object",
    ]
    var valueCheck = [
        C.DELAY >= 0,
        C.RETRY_AMOUNT >= 0,
        C.RETRY_DELAY >= 0,
        C.SPLIT_EVERY_FACTOR > 0,
        C.INCLUDE_PROPERTIES.filter(v => Object.values(MessageProperties).find(f => f == v) == undefined).length <= 0,
        C.EXCLUDE_PROPERTIES.filter(v => Object.values(MessageProperties).find(f => f == v) == undefined).length <= 0,
        C.ID.filter(v => !((typeof v.guild_id == "string") && all(v.channels.map(v2 => typeof v2 == "string")))).length <= 0,
        Object.values(HandleExistingData).find(f => f == C.HANDLE_EXISTING_DATA) != undefined,
        Object.values(HandleIncompleteData).find(f => f == C.HANDLE_INCOMPLETE_DATA) != undefined,
    ]
    return all(typeCheck) && all(valueCheck)
}

async function wait(ms: number) {
    return new Promise<void>(resolve => { setTimeout(() => { resolve() }, ms) })
}

async function fetchWithResult(url: string): Promise<[any, null] | [null, Response | any]> {
    try {
        const response = await fetch(url, HEADER_DATA)

        if (response.ok) {
            const data = await response.json()
            return [data, null]
        } else {
            const error = response
            return [null, error]
        }
    } catch (error) {
        return [null, error]
    }
}

async function getChannelList(guildId: string): Promise<[Channel[], null] | [null, Response | any]> {
    const URL = CHANNEL_LIST_TEMPLATE
        .replace("$GUILD", guildId)

    const RESULT = await fetchWithResult(URL)
    if (RESULT[0] == null) {
        return [null, RESULT[1]]
    } else {
        return [RESULT[0], null]
    }
}

async function countAmountOfMessages(guildId: string, channelId: string): Promise<[number, null] | [null, Response | any]> {
    const URL = TOTAL_MSG_URL_TEMPLATE
        .replace("$GUILD", guildId)
        .replace("$CHANNEL", channelId)

    const RESULT = await fetchWithResult(URL)
    if (RESULT[0] == null) {
        return [null, RESULT[1]]
    } else {
        return [RESULT[0].total_results, null]
    }
}

async function scrapeMessages(channelId: string, after: string): Promise<[Message[], null] | [null, Response | any]>{
    const URL = CHAT_URL_TEMPLATE
        .replace("$CHANNEL", channelId)
        .replace("$AFTER", after)

    const RESULT = await fetchWithResult(URL)
    if (RESULT[0] == null) {
        return [null, RESULT[1]]
    } else {
        return [RESULT[0], null]
    }
}

async function downloadMessages(data: GuildChannelData) {
    LOG(0, chalk.bgBlue(`- server: ${data.guild_id}`))
    const progressBar = new cliProgress.Bar({
        align: "left",
        format: `  ${chalk.cyanBright("channel: {channelId}")} | ${chalk.green("[{bar}] {percentage}%")} | ${chalk.magenta("ETA: {eta}s")} | ${chalk.magenta("downloaded: {value}/~{total}")} | ${chalk.magenta("current file: data-{fileNum}.json")}`,
        barIncompleteChar: "-",
        barCompleteChar: "#",
        etaBuffer: 10,
    })

    const CHANNEL_LIST = await getChannelList(data.guild_id)
    if (CHANNEL_LIST[0] == null) {
        LOG(1, chalk.red(`error: unable to access server ${data.guild_id} or the API token is not valid`))
        return
    }

    fetchMessageLoop: for (const channelId of data.channels) {
        const CHANNEL_DATA_PATH = join(ROOT_DATA_DIR, `server-${data.guild_id}`, `channel-${channelId}`)
        try {
            await fs.mkdir(CHANNEL_DATA_PATH)
            //? Directory doesn't exist
        } catch {
            //? Directory exist | error accessing the directory
            try {
                await fs.access(join(CHANNEL_DATA_PATH, ".INCOMPLETE"), constants.R_OK | constants.W_OK)
                //? Directory isn't fully downloaded
                switch (C.HANDLE_INCOMPLETE_DATA) {
                    case HandleIncompleteData.NOTHING:
                        LOG(1, chalk.yellow(`warning: incomplete scraped message data for channel ${channelId} detected, this channel will be ignored`))
                        continue fetchMessageLoop
                    case HandleIncompleteData.DELETE:
                        LOG(1, chalk.yellow(`warning: incomplete scraped message data for channel ${channelId} detected, now deleting the data`))
                        try {
                            await fs.rm(CHANNEL_DATA_PATH, { recursive: true, force: true })
                            await fs.mkdir(CHANNEL_DATA_PATH)
                        } catch {
                            LOG(2, chalk.red(`error: unable to delete the incomplete scraped message data, this channel will be ignored`))
                            continue fetchMessageLoop
                        }
                        break
                }
            } catch {
                //? Directory is fully downloaded | error accessing the file
                switch (C.HANDLE_EXISTING_DATA) {
                    case HandleExistingData.NOTHING:
                        LOG(1, chalk.yellow(`warning: scraped message data for channel ${channelId} detected, this channel will be ignored`))
                        continue fetchMessageLoop
                    case HandleExistingData.DELETE:
                        LOG(1, chalk.yellow(`warning: scraped message data for channel ${channelId} detected, now deleting the data`))
                        try {
                            await fs.rm(CHANNEL_DATA_PATH, { recursive: true, force: true })
                            await fs.mkdir(CHANNEL_DATA_PATH)
                        } catch {
                            LOG(2, chalk.red(`error: unable to delete the incomplete scraped message data, this channel will be ignored`))
                            continue fetchMessageLoop
                        }
                        break
                }
            }
        }

        try {
            await fs.writeFile(join(CHANNEL_DATA_PATH, ".INCOMPLETE"), "")
        } catch {}

        LOG(1, chalk.yellow(`checking channel ${channelId}`))
        const CHANNEL_METADATA = CHANNEL_LIST[0].find(v => v.id == channelId)

        if (CHANNEL_METADATA == undefined) {
            LOG(1, chalk.red(`error: channel ${channelId} is not a valid channel of the server ${data.guild_id}, this channel will be ignored`))
            continue fetchMessageLoop
        } else if (!SUPPORTED_CHANNEL.includes(CHANNEL_METADATA.type)) {
            LOG(1, chalk.red(`error: channel ${channelId} is not a supported channel (this program only support Text Channel and Voice Channel), this channel will be ignored`))
            continue fetchMessageLoop
        }

        var retryAmount = 0
        var afterMessageId = "0"
        var amountOfMessage = 0
        var countedMessage = 0
        var downloadedData = []
        var fileCount = 0

        countMsgLoop: while (true) {
            const RESULT = await countAmountOfMessages(data.guild_id, channelId)
            if (RESULT[0] == null) {
                if (retryAmount > C.RETRY_AMOUNT) {
                    LOG(1, chalk.red(`error: unable to get amount of messages in channel ${channelId}, this channel will be ignored`))
                    continue fetchMessageLoop
                } else {
                    LOG(1, chalk.yellow(`warning: unable to get amount of messages in channel ${channelId}, now retrying (attempt ${retryAmount}/${C.RETRY_AMOUNT})`))
                    await wait(C.RETRY_DELAY)
                    retryAmount++
                }
            } else {
                amountOfMessage = RESULT[0]
                retryAmount = 0
                break countMsgLoop
            }
        }

        progressBar.start(amountOfMessage, 0, {
            serverId: data.guild_id,
            channelId: channelId,
            fileNum: fileCount
        })

        scrapeMsgLoop: while (true) {
            const RESULT = await scrapeMessages(channelId, afterMessageId)
            if (RESULT[0] == null) {
                if (retryAmount > C.RETRY_AMOUNT) {
                    LOG(1, chalk.red(`error: unable to get messages in channel ${channelId}, this channel will be ignored`))
                    continue fetchMessageLoop
                } else {
                    LOG(1, chalk.red(`error: unable to get messages in channel ${channelId}, now retrying (attempt ${retryAmount}/${C.RETRY_AMOUNT})`))
                    await wait(C.RETRY_DELAY)
                    retryAmount++
                }
            } else {
                var messages = RESULT[0]
                messages.reverse()

                var includeProperties = C.INCLUDE_PROPERTIES.find(v => v == MessageProperties.ALL)
                    ? Object.values(MessageProperties)
                    : C.INCLUDE_PROPERTIES
                var excludeProperties = C.EXCLUDE_PROPERTIES
                var properties = includeProperties.filter(v => !excludeProperties.includes(v))
                var propertiesToRemove = Object.values(MessageProperties).filter(v => !properties.includes(v))
                for (var message of messages) {
                    for (var p of propertiesToRemove) {
                        delete message[p as keyof Message]
                    }
                }

                if (messages.length <= 0) {
                    const OUTPUT = JSON.stringify(downloadedData, null, C.BEAUTIFY ? 4 : 0)

                    try {
                        await fs.writeFile(join(CHANNEL_DATA_PATH, `data-${fileCount}.json`), OUTPUT)
                    } catch {
                        LOG(1, chalk.red(`error: unable to write scraped data onto file "data-${fileCount}.json", the channel's data will be discarded`))
                    }

                    downloadedData = []
                    countedMessage += messages.length
                    progressBar.update(countedMessage)
                    progressBar.stop()
                    break scrapeMsgLoop
                } else {
                    downloadedData.push(...messages)

                    if (downloadedData.length >= C.SPLIT_EVERY_FACTOR * CHUNK_AMOUNT) {
                        const OUTPUT = JSON.stringify(downloadedData, null, C.BEAUTIFY ? 4 : 0)

                        try {
                            await fs.writeFile(join(CHANNEL_DATA_PATH, `data-${fileCount}.json`), OUTPUT)
                        } catch {
                            LOG(1, chalk.red(`error: unable to write scraped data onto file "data-${fileCount}.json", the channel's data will be discarded`))
                        }

                        fileCount++
                        progressBar.update(countedMessage, {
                            fileNum: fileCount
                        })

                        downloadedData = []
                    }

                    afterMessageId = messages[messages.length - 1].id
                    countedMessage += messages.length
                    progressBar.update(countedMessage)
                }

                retryAmount = 0
                await wait(C.DELAY)
            }
        }

        try {
            await fs.rm(join(CHANNEL_DATA_PATH, ".INCOMPLETE"))
        } catch {}
    }
}

(async () => {
    LOG(0, chalk.bgRed("DMS (discord message scraper) v1.0.0"))
    LOG(0, chalk.yellow("checking config"))
    if (!(await checkConfig())) {
        LOG(0, chalk.red(`error: invalid config file`))
        return
    }

    try {
        await fs.access(ROOT_DATA_DIR, constants.R_OK | constants.W_OK)
    } catch {
        try {
            await fs.mkdir(ROOT_DATA_DIR)
        } catch {
            LOG(0, chalk.red(`error: unable to create directory: "${ROOT_DATA_DIR}", check if the program have permission to create the directory`))
            return
        }
    }

    for (const guilds of C.ID) {
        const SERVER_DIR = join(ROOT_DATA_DIR, `server-${guilds.guild_id}`)

        try {
            await fs.mkdir(SERVER_DIR)
        } catch {
            try {
                await fs.access(SERVER_DIR, constants.R_OK | constants.W_OK)
            } catch {
                LOG(0, chalk.red(`error: unable to create or access the directory: "${SERVER_DIR}", check if the program have permission to access/create the directory`))
                return
            }
        }

        await downloadMessages(guilds)
    }
})()