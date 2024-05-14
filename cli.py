import warnings

# https://github.com/urllib3/urllib3/issues/3020
warnings.simplefilter("ignore")
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common import NoSuchElementException
import fire


def new(url: str):
    """Add new blog template"""
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(5)
    driver.get(url)
    title = driver.find_element(By.CLASS_NAME, "css-101rr4k")
    print(title)


if __name__ == "__main__":
    fire.Fire()
