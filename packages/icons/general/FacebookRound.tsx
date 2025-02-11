import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const FacebookRoundIcon: typeof SvgIcon = createIcon(
    'FacebookRoundIcon',
    <g fill="none">
        <rect x="1" y="1" width="24" height="24" rx="12" fill="#3C599B" />
        <path
            d="M13.95 19.25h-2.59V13h-1.295v-2.158h1.295V9.547c0-1.727.725-2.806 2.797-2.806h1.726V8.9h-1.07c-.803 0-.863.303-.863.864v1.079h1.95L15.677 13H13.95v6.25Z"
            fill="#fff"
        />
        <path
            d="M13 24C6.925 24 2 19.075 2 13H0c0 7.18 5.82 13 13 13v-2Zm11-11c0 6.075-4.925 11-11 11v2c7.18 0 13-5.82 13-13h-2ZM13 2c6.075 0 11 4.925 11 11h2c0-7.18-5.82-13-13-13v2Zm0-2C5.82 0 0 5.82 0 13h2C2 6.925 6.925 2 13 2V0Z"
            fill="#F9F9F9"
        />
    </g>,
    '0 0 24 24',
)
