class ApplicationController < ActionController::Base
  before_action :authenticate_request

  private

  def authenticate_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    begin
      @decoded = JsonWebToken.decode(header)
      @current_user = @decoded[:user_id] if @decoded
    rescue JWT::DecodeError => e
      render json: { errors: e.message }, status: :unauthorized
    end

    render json: { error: 'Not Authorized' }, status: :unauthorized unless @current_user
  end
end
