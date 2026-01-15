from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in export_control/__init__.py
from export_control import __version__ as version

setup(
	name="export_control",
	version=version,
	description="Export Control",
	author="Bonito Designs",
	author_email="info@bonito.in",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
