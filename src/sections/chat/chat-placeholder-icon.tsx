import Box, { BoxProps } from '@mui/material/Box';

// ----------------------------------------------------------------------

export default function ChatPlaceholderIcon({ ...other }: BoxProps) {
    return (
        <Box
            component="img"
            src="/assets/icons/start_conversation.png" // Assuming I'll move it here
            sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.1))', // Add soft shadow for depth
                ...other.sx
            }}
            {...other}
        />
    );
}
