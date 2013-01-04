module URLModule
  include PageObject

  def self.base_url
    if ENV['BASE_URL']
      ENV['BASE_URL']
    else
      'test2'
    end
  end
  def self.url(page)
    config = YAML.load_file('config/config.yml')
    "#{config['base_url'][self.base_url]}#{page}"
  end
end
