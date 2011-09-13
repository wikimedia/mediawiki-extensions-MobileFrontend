<?php
$mainPageUrl = self::$mainPageUrl;
$randomPageUrl = self::$randomPageUrl;
$dir = self::$dir;
$code = self::$code;

$applicationHtml = <<<EOT
<?xml version='1.0' encoding='utf-8' ?>
	<!DOCTYPE wml PUBLIC "-//WAPFORUM//DTD WML 1.1//EN" "http://www.wapforum.org/DTD/wml_1.1.xml">
	<wml xml:lang="{$code}" dir="{$dir}">
	  <head>
	    <meta name="ROBOTS" content="NOINDEX, NOFOLLOW" />
	    <meta name="character-set=utf-8" content="charset"/>
	    <meta forua="true" http-equiv="Cache-Control" content="max-age=0"/>
	  </head>
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
EOT;
