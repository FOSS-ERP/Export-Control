from setuptools import setup, find_packages

with open("requirements.txt") as f:
    install_requires = f.read().strip().split("\n")

setup(
    name="export_control",
    version="0.0.1",
    description="Export Control",
    author="Bonito Designs",
    author_email="info@bonito.in",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires,
)
