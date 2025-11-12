# Deployment Guide

This guide will help you deploy the Medicine Tracker application to various platforms.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended)

The easiest way to deploy the Medicine Tracker app:

1. **Install Vercel CLI:**
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Build the project:**
   \`\`\`bash
   npm run build
   \`\`\`

3. **Deploy:**
   \`\`\`bash
   vercel
   \`\`\`

4. **Follow the prompts** and your app will be live!

### 2. Netlify

1. **Build the project:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Drag and drop** the `dist` folder to [Netlify](https://netlify.com)

3. **Or use Netlify CLI:**
   \`\`\`bash
   npm install -g netlify-cli
   netlify deploy --dir=dist --prod
   \`\`\`

### 3. GitHub Pages

1. **Add to package.json:**
   \`\`\`json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   \`\`\`

2. **Install gh-pages:**
   \`\`\`bash
   npm install --save-dev gh-pages
   \`\`\`

3. **Deploy:**
   \`\`\`bash
   npm run deploy
   \`\`\`

## 🌐 Manual Deployment

### Static Hosting

1. **Build the project:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Upload the `dist` folder** to your web server

3. **Configure your server** to serve `index.html` for all routes

### Docker Deployment

1. **Create Dockerfile:**
   \`\`\`dockerfile
   FROM nginx:alpine
   COPY dist/ /usr/share/nginx/html/
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   \`\`\`

2. **Create nginx.conf:**
   \`\`\`nginx
   events {
       worker_connections 1024;
   }
   
   http {
       include /etc/nginx/mime.types;
       default_type application/octet-stream;
       
       server {
           listen 80;
           server_name localhost;
           root /usr/share/nginx/html;
           index index.html;
           
           location / {
               try_files $uri $uri/ /index.html;
           }
       }
   }
   \`\`\`

3. **Build and run:**
   \`\`\`bash
   docker build -t medicine-tracker .
   docker run -p 80:80 medicine-tracker
   \`\`\`

## 🔧 Environment Configuration

### Production Build

The app is configured for production by default. No environment variables are required.

### Custom Configuration

If you need to customize the build:

1. **Create `.env` file:**
   \`\`\`env
   NODE_ENV=production
   \`\`\`

2. **Build with custom settings:**
   \`\`\`bash
   npm run build
   \`\`\`

## 📱 PWA Deployment

The app includes PWA features that work best with HTTPS:

1. **Ensure HTTPS** is enabled on your hosting platform
2. **Verify manifest.json** is accessible at `/manifest.json`
3. **Check service worker** is registered correctly
4. **Test offline functionality**

## 🔍 Post-Deployment Checklist

- [ ] App loads correctly
- [ ] All features work (add, edit, delete medicines)
- [ ] PDF generation works
- [ ] Search and filter functionality
- [ ] Notifications work (if enabled)
- [ ] Mobile responsiveness
- [ ] PWA installation works
- [ ] Offline functionality

## 🛠️ Troubleshooting

### Common Issues

1. **App not loading:**
   - Check if `dist` folder contains all files
   - Verify server configuration for SPA routing

2. **PDF generation fails:**
   - Ensure jsPDF libraries are loaded
   - Check browser console for errors

3. **Notifications not working:**
   - Verify HTTPS is enabled
   - Check browser permissions
   - Ensure service worker is registered

4. **API calls failing:**
   - Check CORS settings
   - Verify RxNav API is accessible

### Performance Optimization

1. **Enable compression** on your web server
2. **Set proper cache headers** for static assets
3. **Use CDN** for external libraries if needed
4. **Monitor bundle size** and optimize if necessary

## 📊 Analytics (Optional)

To add analytics to your deployment:

1. **Google Analytics:**
   \`\`\`html
   <!-- Add to index.html head -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   \`\`\`

2. **Privacy-friendly alternatives:**
   - Plausible Analytics
   - Fathom Analytics
   - Simple Analytics

## 🔒 Security Considerations

- **HTTPS**: Always use HTTPS in production
- **CSP**: Consider adding Content Security Policy headers
- **CORS**: Configure CORS properly if needed
- **Updates**: Keep dependencies updated

## 📞 Support

For deployment issues:
1. Check the browser console for errors
2. Verify all files are uploaded correctly
3. Test locally first with `npm run build && npm start`
4. Contact the developer for assistance

---

**Happy Deploying! 🚀**
