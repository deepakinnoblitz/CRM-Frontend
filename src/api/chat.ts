import { frappeRequest } from 'src/utils/csrf';

import { handleResponse } from './utils';

const BASE_URL = '/api/method/clefincode_chat.api.api_1_2_1.api';

export const chatApi = {
    getChannelsList: async (userEmail: string, limit = 50, offset = 0) => {
        const params = new URLSearchParams({
            user_email: userEmail,
            limit: limit.toString(),
            offset: offset.toString(),
        });
        const response = await frappeRequest(`${BASE_URL}.get_channels_list?${params}`);
        return handleResponse(response);
    },

    getMessages: async (room: string, userEmail: string, roomType: string, limit = 50, offset = 0) => {
        const params = new URLSearchParams({
            room,
            user_email: userEmail,
            room_type: roomType,
            limit: limit.toString(),
            offset: offset.toString(),
        });
        const response = await frappeRequest(`${BASE_URL}.get_messages?${params}`);
        return handleResponse(response);
    },

    sendMessage: async (data: {
        content: string;
        user: string;
        room: string;
        email: string;
        attachment?: string;
        is_media?: number;
        is_voice_clip?: number;
        is_document?: number;
        id_message_local_from_app?: string;
    }) => {
        const response = await frappeRequest(`${BASE_URL}.send`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    getContacts: async (userEmail: string) => {
        const params = new URLSearchParams({ user_email: userEmail });
        const response = await frappeRequest(`${BASE_URL}.get_contacts?${params}`);
        return handleResponse(response);
    },

    createChannel: async (data: {
        channel_name: string;
        users: string; // JSON string
        type: string;
        last_message: string;
        creator_email: string;
        creator: string;
    }) => {
        const response = await frappeRequest(`${BASE_URL}.create_channel`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    createGroup: async (data: {
        selected_contacts_list: string; // JSON string
        user: string;
    }) => {
        const response = await frappeRequest(`${BASE_URL}.create_group`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    deleteMessage: async (messageName: string) => {
        const response = await frappeRequest(`${BASE_URL}.delete_message`, {
            method: 'POST',
            body: JSON.stringify({ message_name: messageName }),
        });
        return handleResponse(response);
    },

    closeChannel: async (room: string) => {
        const response = await frappeRequest(`${BASE_URL}.trigger_chat_channel_status`, {
            method: 'POST',
            body: JSON.stringify({ room, is_open: true }),
        });
        return handleResponse(response);
    },

    reopenChannel: async (room: string) => {
        const response = await frappeRequest(`${BASE_URL}.trigger_chat_channel_status`, {
            method: 'POST',
            body: JSON.stringify({ room, is_open: false }),
        });
        return handleResponse(response);
    },

    markMessagesAsRead: async (userEmail: string, room: string) => {
        const response = await frappeRequest(`${BASE_URL}.mark_messsages_as_read`, {
            method: 'POST',
            body: JSON.stringify({ user: userEmail, channel: room }),
        });
        return handleResponse(response);
    },

    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('is_private', '0');
        formData.append('folder', 'Home');

        const response = await frappeRequest('/api/method/upload_file', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.message) {
            return data.message;
        }
        throw new Error(data.exception || 'File upload failed');
    },
};
