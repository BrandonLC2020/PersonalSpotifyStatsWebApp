import { useState, useEffect } from 'react';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import SpotifyWebApi from 'spotify-web-api-js';
import axios from 'axios';

const useSpotifyWeb = () => {
  const [spotifyApi, setSpotifyApi] = useState<SpotifyWebApi.SpotifyWebApiJs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTokenAndInitSpotify = async () => {
      try {
        // --- Get CLIENT_ID and CLIENT_SECRET from .env file ---
        const clientId = process.env.REACT_APP_CLIENT_ID;
        const clientSecret = process.env.REACT_APP_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          throw new Error('Missing REACT_APP_CLIENT_ID or REACT_APP_CLIENT_SECRET in your .env file');
        }

        // --- AWS Secrets Manager Configuration ---
        const client = new SecretsManagerClient({
          region: process.env.REACT_APP_AWS_DEFAULT_REGION,
          credentials: {
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || '',
          },
        });

        const command = new GetSecretValueCommand({ SecretId: process.env.REACT_APP_SECRET_NAME });
        const data = await client.send(command);

        if (data.SecretString) {
          const secret = JSON.parse(data.SecretString);
          const refreshToken = secret.spotify_refresh_token;

          if (refreshToken) {
            // --- Exchange Refresh Token for Access Token ---
            const response = await axios.post(
              'https://accounts.spotify.com/api/token',
              new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
              }),
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                },
              }
            );

            const accessToken = response.data.access_token;

            if (accessToken) {
              const sp = new SpotifyWebApi();
              sp.setAccessToken(accessToken);
              setSpotifyApi(sp);
            } else {
              throw new Error('Spotify access token not found in response');
            }
          } else {
            throw new Error('Required secrets not found in AWS Secrets Manager');
          }
        } else {
          throw new Error('SecretString is empty');
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenAndInitSpotify();
  }, []);

  return { spotifyApi, loading, error };
};

export default useSpotifyWeb;