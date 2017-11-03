
from views import storage
from django.template.loaders import app_directories

class CloudStorageLoader(app_directories.Loader):
    is_usable = True

    def load_template(self, template_name, template_dirs=None):
        contenido = storage.read_file(template_name)
        return (contenido.content, template_name)