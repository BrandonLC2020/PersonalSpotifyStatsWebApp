Rails.application.routes.draw do
  namespace :api do
    resources :songs, only: [:index]
    resources :artists, only: [:index]
  end
end
```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3000' # Replace with your React app's URL in production
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end