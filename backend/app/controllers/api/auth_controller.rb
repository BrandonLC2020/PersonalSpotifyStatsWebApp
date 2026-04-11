class Api::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:login]

  def login
    password_hash = ENV['APP_PASSWORD_HASH']
    
    if password_hash.blank?
      render json: { error: 'Authentication not configured on server (Missing APP_PASSWORD_HASH)' }, status: :internal_server_error
      return
    end

    if BCrypt::Password.new(password_hash) == params[:password]
      token = JsonWebToken.encode(user_id: 'admin')
      render json: { token: token }, status: :ok
    else
      render json: { error: 'Invalid password' }, status: :unauthorized
    end
  rescue BCrypt::Errors::InvalidHash
    render json: { error: 'Invalid password hash configuration on server' }, status: :internal_server_error
  end
end
