# 🔑 API Credentials Setup Guide

This guide shows you exactly where to add your NVIDIA API credentials to make the Trellis NIM application work.

## 📍 Where to Add Your API Credentials

You need to add your NVIDIA API key in **TWO** places:

### 1. Main Environment File (`.env`)

**Location**: `/trellis-image-vision/.env`

**"""**
**Insert API Credentials here**

```bash
# Open the main environment file
nano .env

# Find this line:
NVIDIA_API_KEY=your_nvidia_api_key_here

# Replace with your actual API key:
NVIDIA_API_KEY=nvapi-your-actual-api-key-goes-here
```
**"""**

### 2. Backend Environment File (`backend/.env`)

**Location**: `/trellis-image-vision/backend/.env`

**"""**
**Insert API Credentials here**

```bash
# Open the backend environment file
nano backend/.env

# Find this line:
TRELLIS_NIM_API_KEY=your_nvidia_api_key_here

# Replace with your actual API key:
TRELLIS_NIM_API_KEY=nvapi-your-actual-api-key-goes-here
```
**"""**

## 🔗 How to Get Your NVIDIA API Key

1. **Visit NVIDIA Build Platform**
   - Go to: https://build.nvidia.com/microsoft/trellis

2. **Sign In**
   - Log in with your NVIDIA developer account
   - Create one if you don't have it

3. **Generate API Key**
   - Navigate to the Trellis model page
   - Click "Get API Key" button
   - Generate a new API key
   - Copy the generated key (starts with `nvapi-`)

4. **Add to Configuration Files**
   - Replace `your_nvidia_api_key_here` with your actual key in both files above

## ✅ Verification

After adding your API key, verify it's working:

```bash
# Check the configuration
grep "NVIDIA_API_KEY" .env
grep "TRELLIS_NIM_API_KEY" backend/.env

# Start the application
./scripts/start.sh

# Check if Trellis NIM service is accessible
./scripts/status.sh
```

## 🚨 Important Notes

- **Keep your API key secret** - never commit it to version control
- **Use the same key** in both configuration files
- **API key format** should start with `nvapi-`
- **No quotes needed** around the API key in the configuration files

## 🔧 Troubleshooting

If you get API key errors:

1. **Verify key format**: Should start with `nvapi-`
2. **Check both files**: Both `.env` and `backend/.env` need the key
3. **No extra spaces**: Make sure there are no spaces around the `=` sign
4. **Restart services**: After changing keys, restart with `./scripts/start.sh`
5. **Check logs**: Use `./scripts/logs.sh` to see detailed error messages

## 📞 Still Need Help?

If you're still having issues:
- Check the main README.md troubleshooting section
- Verify your NVIDIA developer account has access to Trellis
- Ensure your API key hasn't expired
- Contact NVIDIA support for API key issues
