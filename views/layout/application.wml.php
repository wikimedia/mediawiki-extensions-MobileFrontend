<?php
$mainPageUrl = self::$mainPageUrl;
$randomPageUrl = self::$randomPageUrl;
$dir = self::$dir;
$code = self::$code;

$applicationHtml = <<<HTML
<?xml version='1.0' encoding='utf-8' ?>
	<!DOCTYPE wml PUBLIC "-//WAPFORUM//DTD WML 1.3//EN" 
	"http://www.wapforum.org/DTD/wml13.dtd">
	<wml xml:lang="{$code}" dir="{$dir}">
	<template>
	<do name="home" type="options" label="{$homeButton}" >
	 <go href="{$mainPageUrl}"/>
	</do>
	<do name="random" type="options" label="{$randomButton}">
	 <go href="{$randomPageUrl}"/>
	</do>
	</template>
	{$contentHtml}
	</wml>
HTML;
