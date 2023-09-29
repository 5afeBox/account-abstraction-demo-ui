import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'

import introVideo from 'src/assets/intro-chip.webm'
import introImage from 'src/assets/intro-chip.png'

const SafeCoreInfo = () => {
  return (
    <div>
      {/* video loop */}
      <video autoPlay loop muted height="500px" width="500px">
        <source src={introVideo} />
        <img src={introImage} alt="safe core img" />
      </video>

      <Stack direction="row" alignItems="center" spacing={2} marginTop={'8px'} marginLeft={'42px'}>
        <Link href="https://github.com/safe-global/safe-core-sdk" target="_blank">
          Github
        </Link>

        <Link href="https://x.com/xafeglobal" target="_blank">
          𝕏
        </Link>
      </Stack>
    </div>
  )
}

export default SafeCoreInfo
