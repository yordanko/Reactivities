import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
//import fs from 'fs';

export default defineConfig(() => {
    return {
      //this will be production diectory build
      build: {
        outDir: "../API/wwwroot",
      },
      server: {
        port: 3000,
        //Note: Https config on certificate. Generate certificate pem files 
        // https: {
        //   key: fs.readFileSync("./key.pem"),
        //   cert: fs.readFileSync("./localhost_ssl.pem"),
        // },
      },
      plugins: [react()],
    };
})
