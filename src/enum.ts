export enum MessageProperties {
    /**
     * This act as an wildcard for all the message properties
     * This is not a real Discord message properties
     */
    ALL = "special-all", //! SPECIAL
    ACTIVITY = "activity",
    APPLICATION = "application",
    APPLICATION_ID = "application_id",
    ATTACHMENTS = "attachments",
    AUTHOR = "author",
    BLOCKED = "blocked",
    BOT = "bot",
    CALL = "call",
    CHANNEL_ID = "channel_id",
    CODED_LINKS = "coded_links",
    COMPONENTS = "components",
    CONTENT = "content",
    EDITED_TIMESTAMP = "edited_timestamp",
    EMBEDS = "embeds",
    FLAGS = "flags",
    GIFTCODES = "gift_codes",
    ID = "id",
    INTERACTION = "interaction",
    INTERACTION_DATA = "interaction_data",
    INTERACTION_ERROR = "interaction_error",
    IS_SEARCH_HIT = "is_search_hit",
    LOGGING_NAME = "logging_name",
    MENTION_CHANNELS = "mention_channels",
    MENTIONED = "mentioned",
    MENTION_EVERYONE = "mention_everyone",
    MENTION_ROLES = "mention_roles",
    MENTIONS = "mentions",
    MESSAGE_REFERENCE = "message_reference",
    REFERENCED_MESSAGE = "referenced_message",
    NONCE = "nonce",
    PINNED = "pinned",
    REACTIONS = "reactions",
    REFERRAL_TRIAL_OFFER_ID = "referral_trial_offer_id",
    STATE = "state",
    STICKER_ITEMS = "sticker_items",
    STICKERS = "stickers",
    TIMESTAMP = "timestamp",
    TTS = "tts",
    TYPE = "type",
    WEBHOOK_ID = "webhook_id",
}

export enum HandleExistingData {
    NOTHING,
    DELETE,
}

export enum HandleIncompleteData {
    NOTHING,
    DELETE,
}

export enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_ANNOUNCEMENT = 5,
    ANNOUNCEMENT_THREAD = 10,
    PUBLIC_THREAD = 11,
    PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15,
}