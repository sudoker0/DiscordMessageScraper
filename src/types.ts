type Attachment = {
    content_type: string
    filename: string
    height: number
    id: string
    proxy_url: string
    size: number
    url: string
    width: number
    spoiler: boolean
    sensitive: boolean
}

type Author = {
    id: string
    username: string
    discriminator: string
    avatar: string
    avatar_decoration: null //! unknown
    verified: boolean
    bot: boolean
    system: boolean
    mobile: boolean
    desktop: boolean
    premium_type: null //! unknown
    flags: number
    public_flags: number
    purchased_flags: number
    premium_usage_flags: number
    nsfw_allowed: boolean
    guild_member_avatars: Record<string, unknown> //! unknown
    has_bounced_email: boolean
    global_name: string
}

type ChannelMention = {
    id: string
    guild_id: string
    type: number
    name: string
}

type MessageReference = {
    channel_id: string
    guild_id: string
    message_id: string
}

type Reaction = {
    emoji: {
        id: string | null
        name: string
        animated: boolean
    }
    me: boolean
    me_burst: boolean
    count: number
    count_details: {
        burst: number
        normal: number
    }
    burst_count: number
    burst_colors: unknown[] //! unknown
}

type StickerItem = {
    id: string
    format_type: number
    name: string
}

type Sticker = {
    id: string
    name: string
    tags: string
    type: number
    format_type: number
    description: string
    asset: string
    pack_id: string
    sort_value: number
}

type Message = {
    activity: null //? maybe bot specific
    application: null //? maybe bot specific
    application_id: null //? maybe bot specific
    attachments: Attachment[]
    author: Author
    blocked: boolean
    bot: boolean
    call: null //! unknown
    channel_id: string
    coded_links: unknown[] //! unknown
    components: unknown[]  //* bot specific
    content: string
    edited_timestamp: string | null
    embeds: unknown[] //! unknown
    flags: number
    gift_codes: unknown[] //! unknown
    id: string
    interaction: null //* bot specific
    interaction_data: null //* bot specific
    interaction_error: null //* bot specific
    is_search_hit: boolean
    logging_name: null //! unknown
    mention_channels: ChannelMention[] | []
    mentioned: boolean
    mention_everyone: boolean
    mention_roles: string[]
    mentions: string[]
    message_reference: MessageReference | null
    referenced_message: Message | null
    nonce: string
    pinned: boolean
    reactions: Reaction[]
    referral_trial_offer_id: null //! unknown
    state: string
    sticker_items: StickerItem[]
    stickers: Sticker[]
    timestamp: string
    tts: boolean
    type: number
    webhook_id: null //? maybe bot specific
}



type GuildChannelData = {
    guild_id: string
    channels: string[]
}

type GuildChannelList = GuildChannelData[]

type PermissionOverwrite = {
    id: string
    type: number
    allow: string
    deny: string
}

type Channel = {
    id: string
    type: number
    flags: number
    guild_id: string
    name: string
    parent_id: string | null
    position: number
    permission_overwrites: PermissionOverwrite[]

    last_message_id: string | null
    rate_limit_per_user: number | null
    topic: string | null
    nsfw: boolean | null
    theme_color: null
    icon_emoji: {
        id: string | null,
        name: string
    }
}

export {
    GuildChannelList,
    GuildChannelData,
    Message,
    Channel
}