Rails.application.routes.draw do
  namespace :api do
    resources :songs, only: [:index]
    resources :artists, only: [:index]
    resources :albums, only: [:index]
  end
end