/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns:[
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com'
            }
        ]
    },
    compiler: {
        removeConsole:
        process.env.NODE_ENV === 'production' ? {
            exclude: ['error']
        } : false,
    },
};

export default nextConfig;
