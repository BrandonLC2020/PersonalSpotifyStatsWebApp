# backend/config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    post 'login', to: 'auth#login'
    resources :tracks, only: [:index]
    resources :artists, only: [:index]
    resources :albums, only: [:index]

    # Analytics endpoints
    get 'analytics/artist_track_dominance', to: 'analytics#artist_track_dominance'
    get 'analytics/album_concentration', to: 'analytics#album_concentration'
    get 'analytics/new_vs_catalog', to: 'analytics#new_vs_catalog'
    get 'analytics/entity_churn', to: 'analytics#entity_churn'
    get 'analytics/year_summary', to: 'analytics#year_summary'
  end
end