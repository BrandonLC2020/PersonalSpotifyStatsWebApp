# backend/config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    resources :tracks, only: [:index] # <-- Change songs to tracks
    resources :artists, only: [:index]
    resources :albums, only: [:index]
  end
end