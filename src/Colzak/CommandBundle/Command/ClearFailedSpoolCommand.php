<?php

// src/Colzak/CommandBundle/Command/ClearFailedSpoolCommand.php
namespace Colzak\CommandBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ClearFailedSpoolCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('swiftmailer:spool:clear-failures')
            ->setDescription('Clears failures from the spool')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        /** @var $transport \Swift_Transport */
        $transport = $this->getContainer()->get('swiftmailer.transport.real');
        if (!$transport->isStarted()) {
            $transport->start();
        }

        $spoolPath = $this->getContainer()->getParameter('swiftmailer.spool.file.path');
        $finder = Finder::create()->in($spoolPath)->name('*.sending');

        foreach ($finder as $failedFile) {
            // rename the file, so no other process tries to find it
            $tmpFilename = $failedFile.'.finalretry';
            rename($failedFile, $tmpFilename);

            /** @var $message \Swift_Message */
            $message = unserialize(file_get_contents($tmpFilename));
            $output->writeln(sprintf(
                'Retrying <info>%s</info> to <info>%s</info>',
                $message->getSubject(),
                implode(', ', array_keys($message->getTo()))
            ));

            try {
                $transport->send($message);
                $output->writeln('Sent!');
            } catch (\Swift_TransportException $e) {
                $output->writeln('<error>Send failed - deleting spooled message</error>');
            }

            // delete the file, either because it sent, or because it failed
            unlink($tmpFilename);
        }
    }

    protected function microtime_float() {
        list($usec,$sec) = explode(' ', microtime());
        return ((float)$usec + (float)$sec);
    }

    protected function dump($a, OutputInterface $output) {
        $old = reset($a);
        foreach($a as $step => $time) {
            $output->writeln(str_pad($step, 8, ' ', STR_PAD_LEFT) . ' : ' . round($time - $old,5). ' sec.');
            $old = $time;
        }
        $first = reset($a);
        $end   = end($a);
        $output->writeln("\033[32mCommande executée avec succes en : " . round($end - $first,5) . " sec.\033[37m\r\n");
    }
}