import { useState, useEffect } from 'react';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import SpotifyWebApi from 'spotify-web-api-js';
import axios from 'axios';
import { decode as atob, encode as btoa } from 'base-64';
import {
  REACT_APP_CLIENT_ID,
  REACT_APP_CLIENT_SECRET,
  REACT_APP_AWS_DEFAULT_REGION,
  REACT_APP_AWS_ACCESS_KEY_ID,
  REACT_APP_AWS_SECRET_ACCESS_KEY,
  REACT_APP_SECRET_NAME
} from '@env';

const useSpotifyWeb = () => {
  const [spotifyApi, setSpotifyApi] = useState<SpotifyWebApi.SpotifyWebApiJs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTokenAndInitSpotify = async () => {
      try {
        const clientId = REACT_APP_CLIENT_ID;
        const clientSecret = REACT_APP_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          throw new Error('Missing Client ID or Client Secret in environment variables');
        }

        // --- AWS Secrets Manager Configuration ---
        const client = new SecretsManagerClient({
          region: REACT_APP_AWS_DEFAULT_REGION,
          credentials: {
            accessKeyId: REACT_APP_AWS_ACCESS_KEY_ID || '',
            secretAccessKey: REACT_APP_AWS_SECRET_ACCESS_KEY || '',
          },
        });

        const command = new GetSecretValueCommand({ SecretId: REACT_APP_SECRET_NAME });
        const data = await client.send(command);

        if (data.SecretString) {
          const secret = JSON.parse(data.SecretString);
          const refreshToken = secret.spotify_refresh_token;

          if (refreshToken) {
            // --- Exchange Refresh Token for Access Token ---
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', refreshToken);

            const response = await axios.post(
              'https://accounts.spotify.com/api/token',
              params.toString(),
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
        console.error('Spotify initialization error:', err);
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