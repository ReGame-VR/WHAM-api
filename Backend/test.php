<?php
declare(strict_types=1);

include_once("index.php");

use PHPUnit\Framework\TestCase;

final class WHAMTest extends TestCase
{

    public function createTestExamples() {
        echp("here");
        handleRequest("PUT", ["users", "ryan,test,1999-05-05,160,5'11\",He is a person"]);
    }

    public function testPutUsers()
    {
        $this->createTestExamples();
        $this->assertEquals(
            'user@example.com',
            Email::fromString('user@example.com')
        );
    }
}