import { useState, useEffect } from 'react';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import SpotifyWebApi from 'spotify-web-api-js';

const useSpotifyWeb = () => {
  const [spotifyApi, setSpotifyApi] = useState<SpotifyWebApi.SpotifyWebApiJs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTokenAndInitSpotify = async () => {
      try {
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
          const accessToken = secret.spotify_refresh_token; // Assumes your secret has this key

          if (accessToken) {
            const sp = new SpotifyWebApi();
            sp.setAccessToken(accessToken);
            setSpotifyApi(sp);
          } else {
            throw new Error('Spotify access token not found in secret');
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